import PropTypes from "prop-types";
import { Fragment } from "react";
import { MemoTextField } from "../../../components/memo-textfield";
import useFormValidation from "../../../hooks/use-form-validation";
import Joi from "joi";

export const emailValidator = Joi.string().email({ tlds: { allow: false } });

export default function Email({
  formData,
  onChange,
  allowEmpty,
}: {
  formData: any;
  onChange: any;
  allowEmpty: any;
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
        value={value}
        variant="outlined"
      />
    </Fragment>
  );
}

Email.propTypes = {
  allowEmpty: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
