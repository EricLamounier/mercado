import './style.css'

export default function Servicos({situacao, err=''}) {
    return (
        <div className='servico'>
            <div className={`situacao ${situacao ? 'on' : 'off'}`}>
                <div className='circle'/>
            </div>
            <span>{situacao ? 'Servidor ativo!' : `Servidor inativo | ${err}` }</span>
        </div>
    )
}