import { useState, useEffect } from "react";


/***
 * Validates a username against common username-rules.
 * @param username: str - username
 * @param requiredLength: int - min username length
 * @param maxLength;: int - max username length
 * @returns {[bool]} -
 */
const useUsernameValidation = ({username = "", requiredLength = 4, maxLength=40}) => {
  const [validLength, setValidLength] = useState(false);
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [isInvalidUsername, setIsInvalidUsername] = useState(false);

  useEffect(() => {
    setValidLength(username.length >= requiredLength && username.length <= maxLength);
    let validName = /^[a-zA-Z0-9]*$/.test(username);

    if (username){
      if (validLength && validName){
        setIsValidUsername(true);
        setIsInvalidUsername(false);
      }else{
        setIsValidUsername(false);
        setIsInvalidUsername(true);
      }
    }else{
      setIsValidUsername(false);
    }
  }, [username, requiredLength, maxLength]);

  return [isValidUsername, isInvalidUsername];
};

export default useUsernameValidation;