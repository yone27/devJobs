import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos')

    //Limpiar las alertas
    let alertas = document.querySelector('.alertas')

    if (alertas) {
        limpiarAlertas()
    }

    if (skills) {
        skills.addEventListener('click', agregarSkills)

        // una vez que estamos en editar, llamamos la función
        skillsSeleccionados()
    }

    const vacantesListado = document.querySelector('.panel-administracion')

    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado)
    }
})

const skills = new Set()
const agregarSkills = e => {
    if (e.target.tagName === "LI") {
        if (e.target.classList.contains('activo')) {
            // quitarlo del set y la clase
            skills.delete(e.target.textContent)
            e.target.classList.remove('activo')
        } else {
            skills.add(e.target.textContent)
            e.target.classList.add('activo')
        }
        //convertimos en arreglo
        const skillsArray = [...skills]
        document.querySelector('#skills').value = skillsArray
    }
}

const skillsSeleccionados = () => {
    // convertimos en array
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))

    // Seleccionamos solo el texto
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    })

    //inyectamos en el input hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas')
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0])
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas)
            clearInterval(interval)
        }
    }, 2000)

}

const accionesListado = e => {
    e.preventDefault()
    if (e.target.dataset.eliminar) {
        // eliminar por axios
        Swal.fire({
            title: '¿Deseas brorrar esta vacante?',
            text: "Una vacante eliminada no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.value) {
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`

                axios.delete(url, { params: { url } })
                    .then(function(res) {
                        if (res.status === 200) {
                            // Enviar la peticion con axios
                            Swal.fire(
                                'Vacante Eliminada',
                                res.data,
                                'success'
                            )

                            // TODO: Eliminar del dom
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            text: 'Vacante Eliminada',
                            title: 'Hubo un error',
                            type: 'error'
                        })
                    })
            }
        })
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href
    }
}