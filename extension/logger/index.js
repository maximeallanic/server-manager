/*
 * Copyright 2018 Your Company ISC License License
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
                filename: 'error.log',
                handleExceptions: true,
                level: 'error'
            })
        ]
    });

    if (process.env.NODE_ENV !== 'production') {
        app.logger.add(new $winston.transports.Console({
            format: $winston.format.combine(
                $winston.format.colorize(),
                $winston.format.timestamp(),
                $winston.format.align(),
                $winston.format.printf(info => `${ info.timestamp }: ${ info.level }: ${ info.message.replace(/\n/g, ' ') }`)
            ),
            handleExceptions: true,
            level: 'info'
        }));
    }
};
