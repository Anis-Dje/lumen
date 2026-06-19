import React, { useState } from 'react';

interface ShippingData {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string;
}

interface ShippingFormProps {
  initialData: ShippingData;
  onSubmit: (data: ShippingData) => void;
}

interface FieldError {
  [key: string]: string;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ initialData, onSubmit }) => {
  const [form, setForm] = useState<ShippingData>(initialData);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (data: ShippingData): FieldError => {
    const errs: FieldError = {};
    if (!data.shipping_name.trim()) errs.shipping_name = 'Name is required';
    if (!data.shipping_address.trim()) errs.shipping_address = 'Address is required';
    if (!data.shipping_city.trim()) errs.shipping_city = 'City is required';
    if (!data.shipping_postal_code.trim()) errs.shipping_postal_code = 'Postal code is required';
    if (!data.shipping_country.trim()) errs.shipping_country = 'Country is required';
    return errs;
  };

  const handleBlur = (field: string): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleChange = (field: keyof ShippingData, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validate({ ...form, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    setTouched(
      Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (Object.keys(validation).length === 0) {
      onSubmit(form);
    }
  };

  const renderField = (
    field: keyof ShippingData,
    label: string,
    required = true,
    type = 'text'
  ): React.ReactNode => (
    <div className="relative">
      <label
        className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label} {required && <span style={{ color: 'var(--accent-danger)' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          className="input resize-none"
          rows={3}
          placeholder={label}
        />
      ) : (
        <input
          type="text"
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          className="input"
          placeholder={label}
          style={
            touched[field] && errors[field]
              ? { borderColor: 'var(--accent-danger)' }
              : undefined
          }
        />
      )}
      {touched[field] && errors[field] && (
        <p className="mt-1 text-xs" style={{ color: 'var(--accent-danger)' }}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderField('shipping_name', 'Full Name')}
      {renderField('shipping_address', 'Street Address')}

      <div className="grid grid-cols-2 gap-4">
        {renderField('shipping_city', 'City')}
        {renderField('shipping_state', 'State / Province', false)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderField('shipping_postal_code', 'Postal Code')}
        {renderField('shipping_country', 'Country')}
      </div>

      {renderField('notes', 'Order Notes', false, 'textarea')}

      <button type="submit" className="btn-primary w-full py-3">
        Continue to Fidelity Points
      </button>
    </form>
  );
};
