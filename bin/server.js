/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $express = require('express');
const $path = require('path');
const $extension = require('../lib/extension');



const app = $express(), port = process.env.PORT || 80;

$extension.load(app, $path.join(__dirname, '../extension')).then(() => {
    app.listen(port);
    app.logger.info(`Ui Router started on: ${port}`);
}, console.error);


