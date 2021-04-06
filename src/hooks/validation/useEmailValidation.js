import { useState, useEffect } from "react";


/***
 * Validates a e-mail against common e-mail rules.
 * @param email: str - username
 * @param requiredLength: int - min username length
 * @param maxLength;: int - max username length
 * @returns {[bool]} -
 */
const useEmailValidation = ({email = "", requiredLength = 5, maxLength=128}) => {
  const [validLength, setValidLength] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);

  useEffect(() => {
    setValidLength(email.length >= requiredLength && email.length <= maxLength);
    let validPattern =   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email);

    if (email){
      if (validLength && validPattern){
        setIsValidEmail(true);
        setIsInvalidEmail(false);
      }else{
        setIsValidEmail(false);
        setIsInvalidEmail(true);
      }
    }else{
      setIsValidEmail(false);
    }
  }, [email, requiredLength, maxLength]);

  return [isValidEmail, isInvalidEmail];
};

export default useEmailValidation;