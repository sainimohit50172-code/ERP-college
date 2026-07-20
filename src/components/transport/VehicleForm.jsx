import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../../components/forms/FormField.jsx';

export default function VehicleForm({ initial = {}, onCancel = () => {}, onSave }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initial });

  useEffect(() => { reset(initial); }, [initial, reset]);

  const submit = (data) => {
    if (onSave) onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <FormField label="Registration">
        <input {...register('registration', { required: 'Registration required' })} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border" />
        {errors.registration && <p className="text-sm text-rose-400">{errors.registration.message}</p>}
      </FormField>

      <FormField label="Vehicle Number">
        <input {...register('vehicleNumber')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border" />
      </FormField>

      <FormField label="Vehicle Type">
        <select {...register('vehicleType')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border">
          <option>Bus</option>
          <option>Van</option>
          <option>Mini Bus</option>
          <option>Car</option>
        </select>
      </FormField>

      <FormField label="Capacity">
        <input type="number" {...register('capacity')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border" />
      </FormField>

      <FormField label="GPS ID">
        <input {...register('gpsId')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border" />
      </FormField>

      <FormField label="Fuel Type">
        <select {...register('fuelType')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border">
          <option>Diesel</option>
          <option>Petrol</option>
          <option>CNG</option>
        </select>
      </FormField>

      <FormField label="Insurance Number">
        <input {...register('insuranceNumber')} className="w-full rounded-2xl border px-3 py-2 hover-gradient-border" />
      </FormField>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-3xl bg-white/50 px-4 py-2 hover-gradient-border">Cancel</button>
        <button type="submit" className="rounded-3xl bg-sky-400 px-4 py-2 hover-gradient-border">Save</button>
      </div>
    </form>
  );
}
