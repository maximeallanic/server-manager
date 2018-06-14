/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $process = require('process');
const $winston = require('winston');

module.exports = (app) => {
    app.logger = $winston.createLogger({
        level: 'info',
        format: $winston.format.json(),
        transports: [
            new $winston.transports.File({
                filename: '/var/log/ui-router/error.log',
                handleExceptions: true,
                level: 'error'
            }),
            new $winston.transports.Console({
                format: $winston.format.combine(
                    $winston.format.colorize(),
                    $winston.format.timestamp(),
                    $winston.format.align(),
                    $winston.format.printf(info => `${ info.timestamp }: ${ info.level }: ${ info.message }`)
                ),
                handleExceptions: true,
                level: 'info'
            })
        ]
    });
};
