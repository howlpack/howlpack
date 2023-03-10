import { Fragment } from "react";
import { MemoTextField } from "../../../components/memo-textfield";
import useFormValidation from "../../../hooks/use-form-validation";
import Joi from "joi";

export const emailValidator = Joi.string().email({ tlds: { allow: false } });

export default function Email({
  formData,
  onChange,
  allowEmpty,
  disabled = false,
  ...rest
}: {
  formData: any;
  onChange: any;
  onClick?: any;
  allowEmpty?: any;
  disabled?: boolean;
  inputRef?: any;
}) {
  let validator = emailValidator;

  if (allowEmpty) {
    validator = validator.allow("");
  }

  const [invalidEmail, setEmailBlurred] = useFormValidation(
    formData.get("email"),
    validator.messages({})
  );

  const value = formData.get("email");

  return (
    <Fragment>
      <MemoTextField
        error={Boolean(invalidEmail)}
        fullWidth
        helperText={invalidEmail as string}
        id="email"
        label={"Email"}
        name="email"
        //@ts-ignore
        onBlur={setEmailBlurred}
        onChange={onChange}
        required={!allowEmpty}
        type="text"
        value={value || ""}
        variant="outlined"
        disabled={disabled}
        {...rest}
      />
    </Fragment>
  );
}
