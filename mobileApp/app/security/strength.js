import PasswordValidator from "password-validator";


const schema= new PasswordValidator();


schema
.is().min(12)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)
.has().symbols(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123','password','Password','password',
  'password123',
  'passw0rd',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'admin',
  'welcome',
  'letmein']); // Blacklist these values


export function calculateStrength(password){

       return schema.validate(password,{list:true})

}