import { useEffect, useState } from "react";
import "./style.css";

import { Cross2Icon, ChevronRightIcon, TrashIcon } from "@radix-ui/react-icons";
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
    setItem(selectedItem.item || 'kkkk')
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
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/post/item`, {
      item, quantidade, valor, data
    })
    .then(res => {
        addItem(res.data.data)
        handleCloseModal()
    })
    .catch(err => {
        console.error(err)
    })
  }

  const handleUpdate = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/put/item/${selectedItem.id}`, {
      item, quantidade, valor, data, checked: selectedItem.checked
    })
    .then(res => {
      const updatedItem = {
        id: selectedItem.id,
        created_at: selectedItem.created_at,
        item, 
        quantidade, 
        valor: valor === '' ? null : valor, 
        data, 
        checked: selectedItem.checked
      }
        updateItem(updatedItem)
        handleCloseModal()
    })
    .catch(err => {
        console.error(err)
    })
  }

  const handleDelete = () => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/del/item/${selectedItem.id}`)
    .then(res => {
        deleteItem(selectedItem)
        handleCloseModal()
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
