// Configuración de contacto
const CONFIG = {
    email: 'lic.azua@abogadosforenses.org',
    whatsapp: '3337785120', // Formato sin espacios para el link
    empresa: 'Abogados Forenses',
    lic: 'Lic. Azua'
};

// Función para agregar campos extra a las secciones
function addExtraField(sectionId) {
    const container = document.getElementById(`extra-fields-${sectionId}`);
    const fieldId = Date.now();
    
    const div = document.createElement('div');
    div.className = 'form-group dynamic-section';
    div.innerHTML = `
        <div class="dynamic-section-header">
            <span class="dynamic-section-label">📌 Información Adicional ${sectionId}</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Eliminar</button>
        </div>
        <textarea name="extra_info_${sectionId}_${fieldId}" placeholder="Escriba aquí la información adicional..."></textarea>
    `;
    container.appendChild(div);
}

// Reconocimiento de Voz mejorado
const voiceBtn = document.getElementById('start-voice');
const resumenCaso = document.getElementById('resumen-caso');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-MX';
    recognition.continuous = true;
    recognition.interimResults = true;

    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('recording')) {
            recognition.stop();
        } else {
            resumenCaso.focus();
            recognition.start();
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<span>🛑</span> Detener Dictado';
        }
    });

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        // Agregar el texto transcrito
        if (event.isFinal) {
            resumenCaso.value += (resumenCaso.value ? ' ' : '') + transcript;
        }
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<span>🎤</span> Iniciar Dictado por Voz';
    };

    recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<span>🎤</span> Iniciar Dictado por Voz';
        
        let errorMsg = 'Error en el reconocimiento de voz.';
        if (event.error === 'no-speech') {
            errorMsg = 'No se detectó voz. Por favor, intente de nuevo.';
        } else if (event.error === 'network') {
            errorMsg = 'Error de conexión. Verifique su internet.';
        }
        
        alert(errorMsg + ' Puede usar el teclado para escribir.');
    };
} else {
    voiceBtn.style.display = 'none';
    console.log('El navegador no soporta reconocimiento de voz.');
}

// Validación del formulario
function validateForm() {
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const telefono = document.getElementById('cliente-telefono').value.trim();
    const email = document.getElementById('cliente-email').value.trim();
    const asunto = document.getElementById('tipo-asunto').value;
    const resumen = document.getElementById('resumen-caso').value.trim();

    if (!nombre || !telefono || !email || !asunto || !resumen) {
        alert('Por favor, complete todos los campos obligatorios (Nombre, Teléfono, Email, Tipo de Asunto y Resumen del Caso).');
        return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingrese un email válido.');
        return false;
    }

    return true;
}

// Obtener datos del formulario mejorado
function getFormData() {
    const form = document.getElementById('legal-form');
    const formData = new FormData(form);
    const timestamp = new Date().toLocaleString('es-MX');

    let data = {
        timestamp: timestamp,
        cliente: {
            nombre: formData.get('cliente_nombre'),
            telefono: formData.get('cliente_telefono'),
            email: formData.get('cliente_email'),
            domicilio: formData.get('cliente_domicilio'),
            asunto: formData.get('tipo_asunto'),
            urgencia: formData.get('urgencia'),
            documentacion: formData.get('documentacion_inicial'),
            resumen: formData.get('resumen_caso'),
            extra: []
        },
        contraparte: {
            nombre: formData.get('contraparte_nombre'),
            dni: formData.get('contraparte_dni'),
            domicilio: formData.get('contraparte_domicilio'),
            contacto: formData.get('contraparte_contacto'),
            relacion: formData.get('contraparte_relacion'),
            descripcion: formData.get('contraparte_descripcion'),
            extra: []
        },
        documentacion: {
            descripcion: formData.get('doc_descripcion'),
            analisis: formData.get('doc_analisis'),
            observaciones: formData.get('doc_observaciones'),
            extra: []
        }
    };

    // Recoger campos dinámicos
    form.querySelectorAll('.dynamic-section textarea').forEach(textarea => {
        const name = textarea.name;
        if (name.includes('extra_info_1')) data.cliente.extra.push(textarea.value);
        if (name.includes('extra_info_2')) data.contraparte.extra.push(textarea.value);
        if (name.includes('extra_info_3')) data.documentacion.extra.push(textarea.value);
    });

    return data;
}

// Formatear texto para exportación mejorado
function formatText(data) {
    let text = `
╔════════════════════════════════════════════════════════════════╗
║                    EXPEDIENTE LEGAL                            ║
║                  ${CONFIG.empresa}                    ║
║                      ${CONFIG.lic}                          ║
╚════════════════════════════════════════════════════════════════╝

FECHA DE GENERACIÓN: ${data.timestamp}
Contacto: ${CONFIG.email} | Tel: ${CONFIG.whatsapp}

════════════════════════════════════════════════════════════════

I. DATOS GENERALES DEL CLIENTE

Nombre Completo: ${data.cliente.nombre}
Teléfono: ${data.cliente.telefono}
Email: ${data.cliente.email}
Domicilio: ${data.cliente.domicilio || 'No especificado'}

Tipo de Asunto: ${data.cliente.asunto}
Urgencia: ${data.cliente.urgencia}

Documentación Inicial:
${data.cliente.documentacion || 'No especificada'}

Resumen del Caso:
${data.cliente.resumen}

${data.cliente.extra.length > 0 ? `Información Adicional del Cliente:
${data.cliente.extra.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}` : ''}

════════════════════════════════════════════════════════════════

II. INFORMACIÓN DE LA CONTRAPARTE

${data.contraparte.nombre ? `Nombre: ${data.contraparte.nombre}` : 'Nombre: No especificado'}
${data.contraparte.dni ? `DNI/NIF/CIF: ${data.contraparte.dni}` : ''}
${data.contraparte.domicilio ? `Domicilio: ${data.contraparte.domicilio}` : ''}
${data.contraparte.contacto ? `Contacto: ${data.contraparte.contacto}` : ''}
${data.contraparte.relacion ? `Relación con el Cliente: ${data.contraparte.relacion}` : ''}

${data.contraparte.descripcion ? `Descripción:
${data.contraparte.descripcion}` : ''}

${data.contraparte.extra.length > 0 ? `Información Adicional de la Contraparte:
${data.contraparte.extra.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}` : ''}

════════════════════════════════════════════════════════════════

III. DESCRIPCIÓN DE DOCUMENTACIÓN

Documentación Principal:
${data.documentacion.descripcion || 'No especificada'}

${data.documentacion.analisis ? `Análisis Preliminar:
${data.documentacion.analisis}` : ''}

${data.documentacion.observaciones ? `Observaciones Especiales:
${data.documentacion.observaciones}` : ''}

${data.documentacion.extra.length > 0 ? `Documentación Adicional:
${data.documentacion.extra.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}` : ''}

════════════════════════════════════════════════════════════════

NOTAS PARA EL ABOGADO:
- Este expediente fue generado a través del formulario de primera entrevista
- Toda la información debe ser verificada y completada durante la consulta presencial
- Se recomienda solicitar documentos adicionales si es necesario
- Mantener confidencialidad y protección de datos personales

════════════════════════════════════════════════════════════════
Generado por: Abogados Forenses - Sistema de Expedientes
════════════════════════════════════════════════════════════════
    `;
    
    return text;
}

// Exportar a WhatsApp mejorado
function exportToWhatsApp() {
    if (!validateForm()) return;
    
    const data = getFormData();
    const text = formatText(data);
    
    // Limitar el texto para WhatsApp (máximo 4096 caracteres por mensaje)
    const maxLength = 4000;
    let textToSend = text;
    
    if (text.length > maxLength) {
        textToSend = text.substring(0, maxLength) + '\n\n[Expediente truncado - envíe también por Email para el documento completo]';
    }
    
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    showSuccessMessage();
}

// Exportar a Email mejorado
function exportToEmail() {
    if (!validateForm()) return;
    
    const data = getFormData();
    const text = formatText(data);
    const clienteNombre = data.cliente.nombre.replace(/\s+/g, '_');
    const subject = `[EXPEDIENTE] ${data.cliente.asunto} - ${data.cliente.nombre} - ${new Date().toLocaleDateString('es-MX')}`;
    const url = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    showSuccessMessage();
}

// Exportar a formatos de archivo mejorado
function exportToFormat(format) {
    if (!validateForm()) return;
    
    const data = getFormData();
    const text = formatText(data);
    const clienteNombre = data.cliente.nombre.replace(/\s+/g, '_');
    let content = '';
    let filename = `expediente_${clienteNombre}_${new Date().toISOString().split('T')[0]}.${format}`;
    let type = '';

    if (format === 'md') {
        content = text;
        type = 'text/markdown';
    } else if (format === 'html') {
        content = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Expediente Legal</title>
            <style>
                body {
                    font-family: 'Plus Jakarta Sans', Arial, sans-serif;
                    line-height: 1.8;
                    padding: 40px;
                    background: #f5f5f5;
                    color: #333;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    max-width: 900px;
                    margin: 0 auto;
                }
                h1 {
                    color: #0e0e0f;
                    border-bottom: 3px solid #f5c800;
                    padding-bottom: 15px;
                    text-align: center;
                }
                h2 {
                    color: #333;
                    margin-top: 30px;
                    border-left: 4px solid #47c1fe;
                    padding-left: 15px;
                }
                .meta {
                    background: #f8f8f6;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    font-size: 14px;
                    color: #666;
                }
                pre {
                    background: #f4f4f4;
                    padding: 20px;
                    border-radius: 4px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e5e5;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }
                @media print {
                    body { background: white; }
                    .container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📋 Expediente Legal - ${CONFIG.empresa}</h1>
                <div class="meta">
                    <strong>Generado:</strong> ${data.timestamp}<br>
                    <strong>Contacto:</strong> ${CONFIG.email} | Tel: ${CONFIG.whatsapp}
                </div>
                <pre>${text}</pre>
                <div class="footer">
                    <p>© 2026 ${CONFIG.empresa}. Documento confidencial - Protección de datos personales</p>
                </div>
            </div>
        </body>
        </html>`;
        type = 'text/html';
    }

    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessMessage();
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const msg = document.getElementById('success-message');
    msg.classList.add('show');
    setTimeout(() => {
        msg.classList.remove('show');
    }, 3000);
}

// Guardar datos en localStorage (opcional)
function saveFormData() {
    const form = document.getElementById('legal-form');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('legalFormData', JSON.stringify(data));
}

// Cargar datos de localStorage (opcional)
function loadFormData() {
    const saved = localStorage.getItem('legalFormData');
    if (saved) {
        const data = JSON.parse(saved);
        for (let [key, value] of Object.entries(data)) {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = value;
            }
        }
    }
}

// Guardar datos automáticamente cada 30 segundos
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    
    setInterval(() => {
        saveFormData();
    }, 30000);
    
    // Guardar también al cambiar cualquier campo
    document.getElementById('legal-form').addEventListener('change', saveFormData);
});
