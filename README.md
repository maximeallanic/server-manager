<!---
 Copyright 2018 Allanic ISC License License
 For the full copyright and license information, please view the LICENSE
 file that was distributed with this source code.
 Created by mallanic <maxime@allanic.me> at 05/06/2018
-->

# Server Manager
A web interface to manage server as router, file server, etc...

## Functionality
- Create, update, delete Linux user
- Auth with Linux user with JWT token
- View network interfaces
- Highly pluggable

## Install (Tested only on Debian base)
### Install dependency

```
sudo apt-get update
sudo apt install curl -y
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install libpam-dev libpam0g-dev nodejs -y
```

### Install Ui-router

```
sudo npm install -g https://github.com/maximeallanic/server-manager
```


