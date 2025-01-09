import { useEffect, useState } from 'react';
import './App.css';

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br' 

import Row from './components/row';
import Modal from './components/modal';
import LetsStart from './components/letsStart';
import Servicos from './components/servicos';
import Loading from './components/loading';

dayjs.locale('pt-br');
dayjs.extend(customParseFormat);

function App() {

  /*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        if (registration.waiting) {
          notifyUser(registration);
        }
  
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                notifyUser(registration);
              }
            });
          }
        });
      });
  
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATED') {
          notifyUser();
        }
      });
    });
  }
  
  function notifyUser(registration) {
    const userConfirmed = window.confirm(
      'Há uma nova versão disponível. Atualizar agora?'
    );
    if (userConfirmed) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  }*/
  
  const [itens, setItens] = useState([])
  const [selectedItem, setSelectedItem] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeModal, setTypeModal] = useState(0)
  const [serverSituation, setServerSituation] = useState(1)
  const [serverError, setServerError] = useState('')
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [formatedWeek, setFormatedWeek] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const updateItem = (updatedItem) => {
    const newItens = itens.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
    );
    
    const sortedItens = [...newItens].sort((a, b) => {
      if (a.checked === b.checked) return 0;
      return a.checked ? 1 : -1;
  });

    setItens(sortedItens);
  }

  const getItens = async (date) => {
    setIsLoading(true)
    const startOfWeek = date.startOf('week').format('YYYY-MM-DD');
    const endOfWeek = date.endOf('week').add(1, 'day').format('YYYY-MM-DD');
    
    await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get/itens`, {
      params: {
        start: startOfWeek,
        end: endOfWeek
      }
    })
    .then(res => {
      setItens(res.data.data)
    })
    .catch(err => {
      console.error(err)
    }).finally(()=>{
      setIsLoading(false)
    })    
  }

  const addItem = (item) => {
    setItens([...itens, item])
  }

  const deleteItem = (item) => {
    const updatedItens = itens.filter(it => it.id !== item.id)
    setItens(updatedItens)
  }

  const formatedDate = (date) => {
    const startOfWeek = date.startOf('week');
    const endOfWeek = date.endOf('week');

    const firstDayWeek = startOfWeek.format('DD-MMMM');
    const lastDayWeek = endOfWeek.format('DD-MMMM');

    if (startOfWeek.month() === endOfWeek.month()) {
      return `${firstDayWeek.split('-')[0]} a ${lastDayWeek.split('-')[0]} de ${startOfWeek.format('MMMM')}`;
    } else {
      return `${startOfWeek.format('DD/MM')} a ${endOfWeek.format('DD/MM')}`;
    }
  }

  const handleWeek = (opt) => {
    const newDate = selectedDate.add(opt, 'week')
    setSelectedDate(newDate)
    setFormatedWeek(formatedDate(newDate))
    getItens(newDate)
  }

  const toggleModal = (item={}, type=1) => {
    setSelectedItem(item)
    setTypeModal(type)
    setIsModalOpen((prev) => !prev);
  };

  const checkServidor = async () => {
    console.log('Verificando servidor...')
 
    try{
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/check`)
      .then(res => {
        setServerSituation(1)
        console.log('Servidor ativo!')
      })
      .catch(err => {
        setServerSituation(0)
        setServerError(err.code)
      })
    }catch(err){
      console.warn(err)
    }
  }

  useEffect(()=>{
    setFormatedWeek(formatedDate(selectedDate))
    getItens(selectedDate)
    
    checkServidor()
    setInterval(()=>{
      checkServidor()
    }, [5 * 60 * 1000])
  }, [])

  return (
    <div className="App">
      <Servicos situacao={serverSituation} err={serverError}/>
      <div className='header'>
        <ChevronLeftIcon className='icon' onClick={()=>handleWeek(-1)} />
        <div>{formatedWeek}</div>
        <ChevronRightIcon className='icon' onClick={()=>handleWeek(1)}/>
      </div>
      <div className='body'>
        <div className='table'>
          {
            itens.length <= 0 ? (
              <LetsStart />
            ) : (
              itens.map(item => {
                return (
                  <Row 
                    key={item.id} 
                    item={item}
                    updateItem={updateItem}
                    setSelectedItem={setSelectedItem}
                    onClick={toggleModal}
                  />
                )
              })
            )
          }
        </div>
        <button onClick={()=>toggleModal({})} type='button' className='addButton'><PlusIcon className='icon'/></button>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={setIsModalOpen}
        setItens={setItens}
        itens={itens}
        selectedItem={selectedItem}
        addItem={addItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
        type={typeModal}
        formatedDate={formatedDate}
        selectedDate={selectedDate}
      />
      {isLoading && <Loading />}
    </div>
  );
}

export default App;