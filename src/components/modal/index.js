import { useEffect, useState } from "react";
import "./style.css";

import { Cross2Icon, ChevronRightIcon, TrashIcon } from "@radix-ui/react-icons";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import dayjs from 'dayjs';

// 0 - edit | 1 - add | 9 - erro
export default function Modal({ isOpen = false, onClose, type=1, selectedDate, updateItem, addItem, deleteItem, formatedDate, selectedItem }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [item, setItem] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [week, setWeek] = useState('')

  useEffect(()=>{
    setItem(selectedItem.item || '')
    setQuantidade(selectedItem.quantidade || 1)
    setValor(selectedItem.valor || '')
    setData(selectedItem.data || selectedDate.day(6))
    setWeek(selectedItem.data ? formatedDate(dayjs(selectedItem.data)) : formatedDate(selectedDate))
  }, [selectedItem])

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setFadeOut(true);
    const timer = setTimeout(() => {
      setFadeOut(false);
      onClose(false);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleSave = () => {
    const temp_id = uuidv4()

    const _data = {
      id: temp_id,
      temp_id: temp_id,
      item, 
      quantidade, 
      valor,
      data: data.format('YYYY-MM-DD'),
      created_at: false,
      checked: false,
    }

    addItem(_data)
    handleCloseModal()

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/post/item`, _data)
    .then(res => {
        const dt = res.data.data
        _data.id = dt.id
        _data.created_at = dt.created_at
        
        //addItem(res.data.data)
        
    })
    .catch(err => {
        console.error(err)
    })
  }

  const handleUpdate = () => {

    const _data = {
      id: selectedItem.id,
      created_at: selectedItem.created_at,
      item, 
      quantidade, 
      valor: valor === '' ? null : valor, 
      data, 
      checked: selectedItem.checked
    }
    updateItem(_data)
    handleCloseModal()
    
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/put/item/${selectedItem.id}`, _data)
    .then(res => {
      
    })
    .catch(err => {
        console.error(err)
    })
  }

  const handleDelete = () => {
    deleteItem(selectedItem)
    handleCloseModal()
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/del/item/${selectedItem.id}`)
    .then(res => {
    })
    .catch(err => {
        console.error(err)
    })
  }

  return (
    <div className={`modal ${fadeOut ? "fadeOut" : ""}`}>
      <div className={`modalContent ${fadeOut ? "scaleOut" : ""}`}>
        <div className="modalHeader">
            <p style={{fontSize: '16px'}}>{type ? 'Adicionar' : 'Editar'} Item</p>
            <Cross2Icon className="icon" onClick={handleCloseModal}/>
        </div>
        <div className="content">
            <div className="inputBox item">
                <label>*Item:</label>
                <input
                    type="text"
                    value={item}
                    onInput={(e) => setItem(e.target.value)}
                    required
                    />
            </div>
            <div className="inputBox quantidade">
                <label>*Quantidade:</label>
                <input 
                    type='number'
                    value={quantidade}
                    onInput={(e) => setQuantidade(e.target.value)}
                    required
                />
            </div>
            <div className="inputBox valor">
                <label>Valor:</label>
                <input 
                    type='number'
                    value={valor}
                    onInput={(e) => setValor(e.target.value)}
                />
            </div>
            <div className="inputBox data">
                <label>*Semana:</label>
                <input 
                  type='text'
                  onInput={(e) => setData(e.target.value)}
                  readOnly
                  value={week}
                  required
                />
            </div>
        </div>
        <div className={`modalFooter ${type ? 'add' : ''}`}>
            {!type ? (<button onClick={handleDelete} type="button"><TrashIcon className="icon" /></button>) : '' }
            <button onClick={type ? handleSave : handleUpdate} type="submit"><ChevronRightIcon className="icon"/></button>
        </div>
      </div>
    </div>
  );
};
