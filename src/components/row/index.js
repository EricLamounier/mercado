import { useEffect, useState } from 'react'
import './style.css'
import axios from 'axios';

export default function Row({item, updateItem, onClick}) {

    const handleRow = () => {
        console.log(item)
        onClick(item, 0) // type 0 editar
    }

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={`row row-${item.checked}`} onClick={handleRow}>
            <p className='item'>{item.item}</p>
            <p className='qtd'>{item.quantidade}</p>
            <p className='value'>{(item.valor !== null) && (item.valor !== 0) ? `R$ ${item.valor}` : ''}</p>
            <div onClick={stopPropagation}>
                <Checkbox updateItem={updateItem} item={item} chk={item.checked} />
            </div>
        </div>
    )
}

function Checkbox({chk, item, updateItem}) {
    const [checked, setChecked] = useState(0)

    const handleCheckbox = (e) => {
        e.preventDefault()
        const isChecked = checked ? 0 : 1

        setChecked(isChecked)
        console.log(item)
        item.checked = isChecked
        updateItem(item)

        axios.put(`${process.env.REACT_APP_BACKEND_URL}/put/item/${item.id}`, item)
        .then(res => {})
        .catch(err => {
            console.error(err)
        })
    }

    useEffect(()=>{
        setChecked(chk)
    }, [chk])

    return (
        <label className="checkbox" onClick={handleCheckbox}>
            <input checked={chk} type="checkbox"  onChange={handleCheckbox}/>
            <div className="checkmark"></div>
        </label>
    )
}