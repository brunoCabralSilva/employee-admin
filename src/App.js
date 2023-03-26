import { useEffect, useState } from 'react';
import firebaseConfig from './back-end/connection';
import {
  getFirestore,
  collection,
  deleteDoc,
  getDocs,
  addDoc,
  doc,
  setDoc,
  where,
  query,
} from 'firebase/firestore/lite';
import './App.css';

const db = getFirestore(firebaseConfig);

export default function App() {
  const [id, setId] = useState('');
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [salary, setSalary] = useState(0);
  const [sector, setSector] = useState('');
  const [listOfSector, setListOfSector] = useState([]);
  
  useEffect(() => {
    getCollection();
  }, []);
  
  const getCollection = async () => {
    const collectionEmployee = collection(db, "employee")

    const querySnapshot = await getDocs(collectionEmployee);
    
    const data = await querySnapshot._docs.map((item) => {
      return {
        name: item._document.data.value.mapValue.fields.name.stringValue,
        cpf: item._document.data.value.mapValue.fields.cpf.stringValue,
        salary: item._document.data.value.mapValue.fields.salary.doubleValue,
        sector: item._document.data.value.mapValue.fields.sector.arrayValue.values.map((element) => element.stringValue),
      };
    });
    setData(data);
  };

  const addEmployee = async () => {
    if (id === '') {
      const collectionEmployee = collection(db, "employee");
      await addDoc((collectionEmployee), {
        name,
        cpf,
        salary: Number(salary),
        sector: listOfSector,
      });
    } else {
      await setDoc(doc(db, "employee", id), {
        name,
        cpf,
        salary: Number(salary),
        sector: listOfSector,
      });
    }

    setName('');
    setCpf('');
    setSalary(0);
    setSector('');
    setListOfSector([]);
    setId('')
    getCollection();
  };

  const editItem = async (element) => {
    const collectionEmployee = collection(db, "employee");
    const q = query(collectionEmployee, where("cpf", "==", element.cpf));
    const querySnapshot = await getDocs(q);
    setName(querySnapshot.docs[0]._document.data.value.mapValue.fields.name.stringValue);
    setCpf(querySnapshot.docs[0]._document.data.value.mapValue.fields.cpf.stringValue);
    setSalary(querySnapshot.docs[0]._document.data.value.mapValue.fields.salary.doubleValue);
    setListOfSector(querySnapshot.docs[0]._document.data.value.mapValue.fields.sector.arrayValue.values.map((element) => element.stringValue));
    setId(querySnapshot.docs[0]._key.path.segments[querySnapshot.docs[0]._key.path.segments.length -1]);   
  };

  const removeItem = async (element) => {
    const collectionEmployee = collection(db, "employee");
    const q = query(collectionEmployee, where("cpf", "==", element.cpf));
    const querySnapshot = await getDocs(q);
    const id = querySnapshot.docs[0]._key.path.segments[querySnapshot.docs[0]._key.path.segments.length -1];
    await deleteDoc(doc(db, "employee", id));
    getCollection();
  };

  return (
    <div>
      <div className="title">Cadastrar um usuário</div>
      <div className="register">
        <input
          type="text"
          onChange={ (e) => setName(e.target.value) }
          placeholder="Nome"
          value={name}
        />
        <input
          type="text"
          onChange={ (e) => setCpf(e.target.value) }
          placeholder="CPF"
          value={cpf}
        />
        <input
          type="number"
          onChange={ (e) => setSalary(e.target.value) }
          placeholder="Salário"
          value={salary}
        />
        <div>
          <input
            type="text"
            onChange={ (e) => setSector(e.target.value) }
            placeholder="Setor"
            value={sector}
          />
          <button onClick={() => {
            setListOfSector([...listOfSector, sector]);
            setSector('');
          }}>
            Adicionar setor
          </button>
          <div className="list-of-sectors">
            {
              listOfSector.map((element, index) => <span key={ index }>{ element }</span>)
            }
          </div>
        </div>
        <button onClick={ addEmployee } >
          {id === '' ? 'Adicionar' : 'Concluir Edição'}
        </button>
      </div>
      <div className="title">Lista de Usuários</div>
      <div className="list-employees">
        {
          data.map((element, index) => (
            <div className="employee" key={ index }>
              <div> <p>Nome:</p> { element.name } </div>
              <div> <p>CPF:</p> { element.cpf } </div>
              <div> <p>Salário:</p> R${' '}{ element.salary } </div>
              <div>
                <p>Lista de Setores:</p>
                {
                  element.sector.map((item, index) => {
                    if (index === element.sector.length - 2) return (<span key={index}>{item}{' e '}</span>);
                    if (index !== element.sector.length - 1) return (<span key={index}>{item}{', '}</span>);
                    return (<span key={index}>{item}{'.'}</span>);
                  })
                }
              </div>
              <button
                onClick={() => editItem(element)}
                className="button-update"
                type="button"
              >
                Editar  
              </button>
              <button
                onClick={() => removeItem(element)}
                className="button-remove"
                type="button"
              >
                Excluir  
              </button>
            </div>
          ))
        }
      </div>
    </div>
  );
}
