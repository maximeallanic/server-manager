/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 14/06/2018
 */

const helmet = require('helmet');

module.exports = (app) => {
    app.use(helmet())
};
