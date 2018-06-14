/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */
const $fs = require('fs');
const $q = require('q');
const { exec } = require('child_process');
const $authenticatePam = require('authenticate-pam');

module.exports.getUsers = () => {
    return $q.nfcall($fs.readFile, '/etc/passwd', 'utf8').then((passwd) => {
        const users = passwd.split('\n');

        return $q.all(users.map((user) => {
            const data = user.split(':');
            const username = data[ 0 ];

            return $q.nfcall(exec, `finger ${ username }`).then((info) => {
                let name = info[ 0 ].match(/Name:\s([^\r]+)/);
                name = name ? name[ 1 ] : null;

                return {
                    username: data[ 0 ],
                    fullName: name,
                    id: parseInt(data[ 2 ]),
                };
            });

        })).spread(function () {
            return Array.from(arguments);
        });
    });
};

module.exports.getGeneralUsers = () => {
    return module.exports.getUsers().then((users) => {
        return $q.nfcall($fs.readFile, '/etc/login.defs', 'utf8').then((defs) => {
            let min = defs.match(/UID_MIN\s*([0-9]+)/);
            let max = defs.match(/UID_MAX\s*([0-9]+)/);
            min = parseInt(min[ 1 ]);
            max = parseInt(max[ 1 ]);
            return users.filter((user) => {
                return (user.id >= min && user.id <= max);
            });
        });
        return users;
    });
};

module.exports.getUser = (uuid) => {
    return module.exports.getUsers().then((users) => {
        return users.filter(user => uuid === user.id)[0];
    });
};

module.exports.getUserByUsername = (username) => {

    return module.exports.getUsers().then((users) => {
        for (id in users)
            if (users[id].username === username)
                return users[id];
    });
};

module.exports.createUser = (user) => {
    return $q.nfcall(exec, `adduser ${ user.username } --quiet --disabled-password --gecos "${ user.fullName }" --shell /bin/false`).then((output) => {
        return $q.nfcall(exec, `echo ${ user.username }:${ user.password} | chpasswd -c SHA512`);
    });
};

module.exports.updateUser = (uuid, user) => {
    return $q.nfcall(exec, `usermod -c "${user.fullName}" ${ user.username }`);
};

module.exports.deleteUser = (uuid) => {
    return module.exports.getUser(uuid).then((user) => {
        return $q.nfcall(exec, `userdel -r  ${ user.username }`);
    });
};

module.exports.login = (username, password) => {
    var deferred = $q.defer();
    $authenticatePam.authenticate(username, password, (err) => {
        if (err) {
            deferred.reject(err);
        }
        else {
            try {
                module.exports.getUserByUsername(username).then(deferred.resolve, deferred.reject);
            } catch (e) {
                console.error(e);
                deferred.reject(e);
            }
        }
    }, {
        remoteHost: 'localhost',
        serviceName: 'common-auth'
    });
    return deferred.promise;
};
