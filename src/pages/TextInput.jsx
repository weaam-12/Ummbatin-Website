const TextInput = ({ type, placeholder, value, onChange }) => (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="text-input" />
);

export default TextInput;
