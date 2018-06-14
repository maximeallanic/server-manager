/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 14/06/2018
 */

var Service = require('node-service-linux').Service;

// Create a new service object
var svc = new Service({
    name: 'server-manager',
    description: 'Web Ui Server Manager.',
    script: $path.join(__dirname, 'server.js'),
    user: 'root',
    group: 'root'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.install();
