/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 13/06/2018
 */

#include <nan.h>
#include <unistd.h>
#include <uv.h>
#include <string>
#include <cstring>
#include <stdlib.h>

#include <security/pam_appl.h>

using namespace v8;

void Login(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, "world"));
}

void Method(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, "world"));
}

extern "C" NODE_MODULE_EXPORT void INITIALIZER(v8::Local<v8::Object> exports,
                                               v8::Local<v8::Value> module,
                                               v8::Local<v8::Context> context)
{
    NODE_SET_METHOD(exports, "login", Login);
    NODE_SET_METHOD(exports, "get", Get);
    NODE_SET_METHOD(exports, "getAll", GetAll);
    NODE_SET_METHOD(exports, "getAllGeneral", GetAllGeneral);
    NODE_SET_METHOD(exports, "create", Create);
    NODE_SET_METHOD(exports, "update", Update);
    NODE_SET_METHOD(exports, "delete", Delete);
}

struct auth_context
{
    auth_context()
    {
        remoteHost[0] = '\0';
        serviceName[0] = '\0';
        username[0] = '\0';
        password[0] = '\0';
    }
    Nan::Persistent<Function> callback;
    char serviceName[128];
    char username[128];
    char password[128];
    char remoteHost[128];
    int error;
    std::string errorString;
};

static int function_conversation(int num_msg, const struct pam_message **msg, struct pam_response **resp, void *appdata_ptr)
{
    auth_context *data = static_cast<auth_context *>(appdata_ptr);
    struct pam_response *reply = (struct pam_response *)malloc(sizeof(struct pam_response));
    reply->resp = strdup((char *)data->password);
    reply->resp_retcode = 0;
    *resp = reply;
    return PAM_SUCCESS;
}

#define HANDLE_PAM_ERROR(header)                                                                                                                            \
    if (retval != PAM_SUCCESS)                                                                                                                              \
    {                                                                                                                                                       \
        data->errorString = header[0] ? (std::string(header) + std::string(": ")) : std::string("") + std::string(pam_strerror(local_auth_handle, retval)); \
        data->error = retval;                                                                                                                               \
        pam_end(local_auth_handle, retval);                                                                                                                 \
        return;                                                                                                                                             \
    }

// actual authentication function
void doing_auth_thread(uv_work_t *req)
{
    auth_context *data = static_cast<auth_context *>(req->data);

    const struct pam_conv local_conversation = {function_conversation, (void *)data};
    pam_handle_t *local_auth_handle = NULL; // this gets set by pam_start

    int retval = pam_start(strlen(data->serviceName) ? data->serviceName : "login",
                           data->username, &local_conversation, &local_auth_handle);
    HANDLE_PAM_ERROR("pam_start")

    if (strlen(data->remoteHost))
    {
        retval = pam_set_item(local_auth_handle, PAM_RHOST, data->remoteHost);
        HANDLE_PAM_ERROR("pam_set_item")
    }
    retval = pam_authenticate(local_auth_handle, 0);
    HANDLE_PAM_ERROR("")

    retval = pam_end(local_auth_handle, retval);
    if (retval != PAM_SUCCESS)
    {
        data->errorString = "pam_end: " + std::string(pam_strerror(local_auth_handle, retval));
        data->error = retval;
        return;
    }
    data->error = 0;
    return;
}

void after_doing_auth(uv_work_t *req, int status)
{
    Nan::HandleScope scope;

    auth_context *m = static_cast<auth_context *>(req->data);
    Nan::TryCatch try_catch;

    Local<Value> args[1] = {Nan::Undefined()};
    if (m->error)
    {
        args[0] = Nan::New<String>(m->errorString.c_str()).ToLocalChecked();
    }

    Nan::MakeCallback(Nan::GetCurrentContext()->Global(), Nan::New(m->callback), 1, args);

    m->callback.Reset();

    delete m;
    delete req;

    if (try_catch.HasCaught())
        Nan::FatalException(try_catch);
}

NAN_METHOD(Authenticate)
{
    if (info.Length() < 3)
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }

    Local<Value> usernameVal(info[0]);
    Local<Value> passwordVal(info[1]);
    if (!usernameVal->IsString() || !passwordVal->IsString())
    {
        Nan::ThrowTypeError("Argument 0 and 1 should be a String");
        return;
    }
    Local<Value> callbackVal(info[2]);
    if (!callbackVal->IsFunction())
    {
        Nan::ThrowTypeError("Argument 2 should be a Function");
        return;
    }

    Local<Function> callback = Local<Function>::Cast(callbackVal);

    Local<String> username = Local<String>::Cast(usernameVal);
    Local<String> password = Local<String>::Cast(passwordVal);

    uv_work_t *req = new uv_work_t;
    struct auth_context *m = new auth_context;

    if (info.Length() == 4 && !info[3]->IsUndefined())
    {
        Local<Array> options = Local<Array>::Cast(info[3]);
        Local<Value> res = options->Get(Nan::New<String>("serviceName").ToLocalChecked());
        if (!res->IsUndefined())
        {
            Local<String> serviceName = Local<String>::Cast(res);
            serviceName->WriteUtf8(m->serviceName, sizeof(m->serviceName) - 1);
        }
        res = options->Get(Nan::New<String>("remoteHost").ToLocalChecked());
        if (!res->IsUndefined())
        {
            Local<String> remoteHost = Local<String>::Cast(res);
            remoteHost->WriteUtf8(m->remoteHost, sizeof(m->remoteHost) - 1);
        }
    }
    m->callback.Reset(callback);

    username->WriteUtf8(m->username, sizeof(m->username) - 1);
    password->WriteUtf8(m->password, sizeof(m->password) - 1);

    req->data = m;

    uv_queue_work(uv_default_loop(), req, doing_auth_thread, after_doing_auth);

    info.GetReturnValue().Set(Nan::Undefined());
}

void init(Handle<Object> exports)
{
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(Authenticate);
    exports->Set(Nan::New<String>("login").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("delete").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("update").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("create").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("get").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("getAll").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New<String>("getAllGeneral").ToLocalChecked(), tpl->GetFunction());
}

NODE_MODULE(authenticate_pam, init);
