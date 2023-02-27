import { Fragment } from "react";
import { MemoTextField } from "../../../components/memo-textfield";
import useFormValidation from "../../../hooks/use-form-validation";
import Joi from "joi";

export const urlValidator = Joi.string().uri();

export default function UrlInput({
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
  let validator = urlValidator;

  if (allowEmpty) {
    validator = validator.allow("");
  }

  const [invalidEmail, setEmailBlurred] = useFormValidation(
    formData.get("url"),
    validator.messages({})
  );

  const value = formData.get("url");

  return (
    <Fragment>
      <MemoTextField
        error={Boolean(invalidEmail)}
        fullWidth
        helperText={invalidEmail as string}
        id="url"
        label={"URL"}
        name="url"
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
