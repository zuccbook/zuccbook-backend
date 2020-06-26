'use strict'

/*
|--------------------------------------------------------------------------
| A_EventSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const SecurityEvent = use("App/Models/Event")

class A_EventSeeder {
  async run () {
    const eventTypeArray = ['Login',"LoginFail","NameChange","PasswordChange","postCreate"]
   try{
     for(let item of eventTypeArray){
       const securityEvent = new SecurityEvent()
       securityEvent.event_type = item
       securityEvent.save()
     }
   }catch (err) {
      console.log(err)

   }
  }
}

module.exports = A_EventSeeder
