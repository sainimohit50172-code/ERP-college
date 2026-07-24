import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import { assessmentModelOptions } from '../../services/subjectMappingTypes.js';

export default function AssessmentModelSelect({ value, onChange }) {
  return (
    <SearchableSelect
      options={assessmentModelOptions}
      value={value}
      onChange={onChange}
      placeholder="Select assessment model"
      required
    />
  );
}
