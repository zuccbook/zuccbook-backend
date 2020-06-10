const {ServiceProvider} = require('@adonisjs/fold')
const DefaultConsoleDriver = require('@adonisjs/framework/src/Logger/Drivers/Console')
const _ = use('lodash')

class ReidunLoggerProvider extends ServiceProvider {
  register() {
    this.app.extend('Adonis/Src/Logger', 'custom', () => {
      class RLogger extends DefaultConsoleDriver {
        log(level, msg, ...meta) {
          const levelName = _.findKey(this.levels, (num) => {
            return num === level
          })
          this.logger.log(levelName, `${new Date().toLocaleString()} :: ${msg}`, ...meta)
        }
      }

      return new RLogger()
    })
  }
}

module.exports = ReidunLoggerProvider
