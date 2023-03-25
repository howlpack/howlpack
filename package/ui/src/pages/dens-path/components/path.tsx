import { Fragment } from "react";
import { MemoTextField } from "../../../components/memo-textfield";
import useFormValidation from "../../../hooks/use-form-validation";
import Joi from "joi";

export const pathValidator = Joi.string();

export default function Path({
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
  let validator = pathValidator;

  if (allowEmpty) {
    validator = validator.allow("");
  }

  const [invalidPath, setPathBlurred] = useFormValidation(
    formData.get("path"),
    validator.messages({})
  );

  const value = formData.get("path");

  return (
    <Fragment>
      <MemoTextField
        error={Boolean(invalidPath)}
        fullWidth
        helperText={invalidPath as string}
        id="path"
        label={"Path"}
        name="path"
        //@ts-ignore
        onBlur={setPathBlurred}
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
