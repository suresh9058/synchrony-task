import {
	ChangeEvent,
	FC,
	FocusEvent,
	FormEvent,
	useState,
  Dispatch,
  SetStateAction,
  useEffect
} from 'react';

type InputTypes = 'text' | 'number';

type CheckerResponse = Promise<{ isValid: boolean; message?: string }>;

type InputState = Record<string,{value:string; isInvalidInput: boolean; info: string}>;

interface InputStructure {
	name: string;
	label: string;
	errorMessage: string;
	type: InputTypes;
	checker: (value: string) => CheckerResponse;
}

const INPUTS: Array<InputStructure> = [
  {
		name: 'customerName',
		label: 'Customer Name',
		errorMessage: 'Customer Name is mandatory.',
		type: 'text',
		checker: async (value: string) => ({ isValid: !!value.trim() }),
	},
  {
		name: 'routingNumber',
		label: 'Routing Number',
		errorMessage: 'Not a valid Routing Number.',
		type: 'text',
		checker: async (value: string) => {
			let isValid = false;
			let bank = '';
			if (!value) {
				return { isValid, message: bank };
			}
			try {
				const res = await fetch(
					`https://www.routingnumbers.info/api/name.json?rn=${value}`
				);
				const result = await res.json();
				if (result.code === 200) {
					isValid = true;
					bank = result.name;
				}
			} catch (e: unknown) {
				isValid = false;
				console.log({ e });
			}
			return { isValid, message: bank };
		},
	},
	{
		name: 'bankAccount',
		label: 'Bank Account',
		errorMessage:
			'Invalid Bank Account Number. Account Number length should be in the range 5 to 17',
		type: 'number',
		checker: async (value: string) => ({
			isValid: value.length >= 5 && value.length <= 17,
		}),
	},
	{
		name: 'reBankAccount',
		label: 'Re-enter Bank Account',
		errorMessage: 'Mismatch in Bank Account Number.',
		type: 'number',
		checker: async (value: string) => {
			if (!value) {
				return { isValid: false };
			}
			const bankAccountValue = document
				.getElementById('bankAccount')
				?.getAttribute('value');
			return { isValid: bankAccountValue === value };
		},
	},
  {
		name: 'accountNickname',
		label: 'Account Nickname',
		errorMessage: 'Account Nickname is mandatory.',
		type: 'text',
		checker: async (value: string) => ({ isValid: !!value.trim() }),
	}
];

interface InputProps {
	name: string;
	errorMessage: string;
	type: InputTypes;
	label: string;
  value: string;
  info: string;
  isInvalidInput: boolean;
  setState: Dispatch<SetStateAction<InputState>>;
	checker: (value: string) => CheckerResponse;
}

const Input: FC<InputProps> = ({
	checker,
	name,
	errorMessage,
	label,
	type,
  value,
  info,
  isInvalidInput,
  setState
}) => {
		const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
    setState((prev)=>({...prev, [name]:{...prev[name], value}}))
	};

	const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (name === 'routingNumber') {
      setState((prev)=>({...prev, [name]:{...prev[name], info: 'Loading...'}}))
		}
    setState((prev)=>({...prev, [name]:{...prev[name], isInvalidInput: false}}))
		const check = await checker(value);
		if (check.isValid) {
      setState((prev)=>({...prev, [name]:{...prev[name], isInvalidInput: false, info: check.message ?? ""}}))
		} else {
      setState((prev)=>({...prev, [name]:{...prev[name], isInvalidInput: true, info: ""}}))
		}
	};

	return (
		<>
			<label htmlFor={name} style={{ marginTop: 16 }}>
				{label}
			</label>
			<input
				value={value}
				type={type}
				id={name}
				name={name}
				onChange={handleChange}
				onBlur={handleBlur}
				style={{
					backgroundColor: '#302e2e',
					color: 'white',
					padding: 8,
					border: 0,
					borderRadius: 8,
					marginTop: 8,
				}}
			/>
			{isInvalidInput ? (
				<p style={{ color: 'red', margin: '8px 0 0 0' }}>{errorMessage}</p>
			) : (
				<></>
			)}
			<p style={{ color: 'white', margin: '8px 0 0 0' }}>{info}</p>
		</>
	);
};

export const Payments: FC = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [state,setState] = useState<InputState>(()=>{
    return INPUTS.reduce((p,c)=>({
          ...p,
          [c.name]: { 
            value: "",
            isInvalidInput: false,
            info:""
          }
      }),{})
  });

  useEffect(()=>{
    if(Object.values(state).every(eachState=>!eachState.isInvalidInput && eachState.value.trim())) {
       setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  },[state]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if(Object.values(state).every(eachState=>!eachState.isInvalidInput && eachState.value.trim())) {
      alert(JSON.stringify(state));
    } 
	};
  
  console.log("state:",state);
  return (
		<div
			style={{
				padding: 16,
				backgroundColor: '#000000e3',
				color: 'white',
				minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center'
			}}
		>
			<form
				style={{
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: 'black',
					padding: 16,
					borderRadius: 16,
          width: '25%',
          height:'25%'
				}}
				noValidate
				onSubmit={handleSubmit}
			>
				{INPUTS.map(({ checker, name, errorMessage, label, type }) => (
					<Input
						key={name}
						name={name}
						label={label}
						errorMessage={errorMessage}
						type={type}
						checker={checker}
            value={state[name].value}
            isInvalidInput={state[name].isInvalidInput}
            info={state[name].info}
            setState={setState}
					/>
				))}
				<button
					style={{
						margin: '24px 0',
						backgroundColor: isFormValid ? '#3fb63fb0' : "grey",
						color: 'white',
						padding: 12,
						border: 0,
						borderRadius: 8,
						textTransform: 'uppercase',
						cursor:  isFormValid ? 'pointer' : 'not-allowed'
					}}
          disabled= {!isFormValid}
					type="submit"
				>
					Submit
				</button>
			</form>
		</div>
	);
};
