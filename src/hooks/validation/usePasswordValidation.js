import { useState, useEffect } from "react";


/***
 * Validates a password against common password-rules.
 * @param firstPassword: str
 * @param secondPassword: str
 * @param requiredLength: int - password min size
 * @param maxLength: int - password max size
 * @returns {[bool, bool, bool, bool]} -
 *    isValidPassword: if the password does not violate the password-rules.
 *    isInvalidPassword: if the password does violate the password-rules.
 *    isValidPasswordMatch: if the two password are the same.
 *    isInvalidPasswordMatch: if the two password are note the same.
 */
const usePasswordValidation = ({firstPassword = "", secondPassword = "", requiredLength = 8, maxLength=128}) => {
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [upperCase, setUpperCase] = useState(false);
  const [lowerCase, setLowerCase] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [isValidPasswordMatch, setIsValidPasswordMatch] = useState(false);
  const [isInvalidPasswordMatch, setIsInvalidPasswordMatch] = useState(false);

  useEffect(() => {
    setValidLength(firstPassword.length >= requiredLength && firstPassword.length <= maxLength);
    setUpperCase(firstPassword.toLowerCase() !== firstPassword);
    setLowerCase(firstPassword.toUpperCase() !== firstPassword);
    setHasNumber(/\d/.test(firstPassword));
    setSpecialChar(/[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/.test(firstPassword));

    if(firstPassword){
      if (validLength && hasNumber && upperCase && lowerCase && specialChar){
        setIsValidPassword(true);
        setIsInvalidPassword(false);
      }else{
        setIsValidPassword(false);
        setIsInvalidPassword(true);
      }

      if(secondPassword && validLength && firstPassword === secondPassword){
        setIsValidPasswordMatch(true);
        setIsInvalidPasswordMatch(false);
      }else{
        setIsValidPasswordMatch(false);
        setIsInvalidPasswordMatch(true);
      }
    }
  }, [firstPassword, secondPassword, requiredLength, maxLength, hasNumber, lowerCase, specialChar, upperCase,
    validLength]);

  return [isValidPassword, isInvalidPassword, isValidPasswordMatch, isInvalidPasswordMatch];
};

export default usePasswordValidation;