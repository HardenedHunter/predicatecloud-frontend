import React, { FormEvent, ChangeEvent, Component } from 'react';
import { InputType } from 'reactstrap/lib/Input';
import Joi from 'joi';
import InputField from './../InputField';
import { Button } from 'reactstrap';

export interface FormSchema {
  [key: string]: Joi.Schema;
}

export interface FormData {
  [key: string]: string;
}

export interface FormState {
  data: FormData;
  errors: FormData;
}

export default abstract class BaseForm<BaseFormProps = any> extends Component<
  any
> {
  state: FormState = {
    data: {},
    errors: {},
  };

  abstract schema: FormSchema;
  abstract doSubmit: () => void;

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors: FormData = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = (name: string, value: string) => {
    const property = { [name]: value };
    const propSchema: FormSchema = { [name]: this.schema[name] };
    const { error } = Joi.validate(property, propSchema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const errors = this.validate() || {};
    this.setState({ errors });
    if (Object.entries(errors).length > 0) return;

    this.doSubmit();
  };

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    const data = { ...this.state.data };
    data[name] = value;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    this.setState({ data, errors });
  };

  renderButton = (
    label: string,
    color: string = 'primary',
    outline: boolean = false
  ) => {
    return (
      <Button outline={outline} color={color} className="btn btn-primary">
        {label}
      </Button>
    );
  };

  renderInputField = (
    name: string,
    label: string,
    placeholder: string = label,
    type: InputType = 'text'
  ) => {
    const { data, errors } = this.state;
    return (
      <InputField
        name={name}
        label={label}
        placeholder={placeholder}
        type={type}
        value={data[name]}
        error={errors[name]}
        onChange={this.handleChange}
      />
    );
  };
}
