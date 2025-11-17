'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiDownload, FiCalendar, FiUser, FiCreditCard, FiDroplet, FiTruck } from 'react-icons/fi';

interface TicketData {
  codigo_ticket: number;
  fecha_agendada: string;
  litros: number;
  tipo_combustible: 'gasolina' | 'gasoil';
  cliente: {
    nombre: string;
    cedula: string;
    telefono: string;
    placa?: string;
    categoria: string;
  };
  subcliente?: {
    nombre: string;
    cedula?: string;
    placa?: string;
  } | null;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: TicketData | null;
}

export default function TicketModal({ isOpen, onClose, ticketData }: TicketModalProps) {
  if (!ticketData) return null;

  const descargarTicket = () => {
    const tipoLabel = ticketData.tipo_combustible === 'gasoil' ? 'GASOIL' : 'GASOLINA';
    const trabajadorLinea = ticketData.subcliente?.nombre
      ? `\nTRABAJADOR ASIGNADO\n--------------------\nNombre: ${ticketData.subcliente.nombre}\nCédula: ${ticketData.subcliente.cedula || 'No registrada'}\nPlaca: ${ticketData.subcliente.placa || 'No registrada'}\n`
      : '';

    const ticketContent = `
SISTEMA DE DESPACHO DE GAS
==========================

TICKET DE AGENDAMIENTO
Código: #${ticketData.codigo_ticket.toString().padStart(3, '0')}

INFORMACIÓN DEL CLIENTE
-----------------------
Nombre: ${ticketData.cliente.nombre}
Cédula: ${ticketData.cliente.cedula}
Teléfono: ${ticketData.cliente.telefono}
Dependencia: ${ticketData.cliente.categoria}
Placa: ${ticketData.cliente.placa || 'No registrada'}

${trabajadorLinea}

DETALLES DEL AGENDAMIENTO
-------------------------
Fecha de Agendamiento: ${new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} ${new Date().toLocaleTimeString('es-ES')} (HOY)
Fecha de Retiro: ${new Date(ticketData.fecha_agendada).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} (MAÑANA)
Litros Agendados: ${ticketData.litros}L
Tipo: ${tipoLabel}
Estado: Confirmado

INSTRUCCIONES
-------------
1. Presente este ticket el día de retiro
2. Horario de atención: 8:00 AM - 5:00 PM
3. Traiga su cédula de identidad
4. El combustible será procesado automáticamente a las 5:00 AM

¡Gracias por usar nuestro sistema!
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${ticketData.codigo_ticket.toString().padStart(3, '0')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">Ticket de Agendamiento</h3>
                      <p className="text-blue-100 text-sm">Sistema de Despacho de Gas</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-blue-200 transition-colors"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Ticket Content - Layout Horizontal */}
                <div className="px-6 py-6">
                  {/* Header del Ticket */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        #{ticketData.codigo_ticket.toString().padStart(3, '0')}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Agendamiento Confirmado</h4>
                  </div>

                  {/* Layout Horizontal - 2 Columnas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda - Información del Cliente */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FiUser className="mr-2 text-blue-600" />
                          Información del Cliente
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span className="font-medium">{ticketData.cliente.nombre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cédula:</span>
                            <span className="font-medium">{ticketData.cliente.cedula}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Teléfono:</span>
                            <span className="font-medium">{ticketData.cliente.telefono}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dependencia:</span>
                            <span className="font-medium">{ticketData.cliente.categoria}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Placa:</span>
                            <span className="font-medium">{ticketData.cliente.placa || 'No registrada'}</span>
                          </div>
                          {ticketData.subcliente?.nombre && (
                            <>
                              <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 mt-2">
                                <span className="text-gray-600">Trabajador:</span>
                                <span className="font-medium">{ticketData.subcliente.nombre}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">CI Trabajador:</span>
                                <span className="font-medium">{ticketData.subcliente.cedula || 'No registrada'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Placa Trabajador:</span>
                                <span className="font-medium">{ticketData.subcliente.placa || 'No registrada'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Instrucciones */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones Importantes</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Presente este ticket el día de retiro</li>
                          <li>• Traiga su cédula de identidad</li>
                          <li>• Horario: 8:00 AM - 5:00 PM</li>
                          <li>• El combustible será entregado por el administrador</li>
                        </ul>
                      </div>
                    </div>

                    {/* Columna Derecha - Detalles del Agendamiento */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FiCalendar className="mr-2 text-blue-600" />
                          Detalles del Agendamiento
                        </h5>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de Agendamiento:</span>
                            <span className="font-medium">
                              {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} (HOY)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de Retiro:</span>
                            <span className="font-medium text-blue-600">
                              {new Date(ticketData.fecha_agendada).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} (MAÑANA)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Litros Agendados:</span>
                            <span className="font-bold text-blue-600">{ticketData.litros}L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo de Combustible:</span>
                            <span className="font-medium">{ticketData.tipo_combustible.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">✅ Estado del Agendamiento</h5>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>• <strong>Estado:</strong> Confirmado</p>
                          <p>• <strong>Hora de Agendamiento:</strong> {new Date().toLocaleTimeString('es-ES')}</p>
                          <p>• <strong>Procesamiento:</strong> Automático a las 5:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer con botones */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                  <button
                    onClick={descargarTicket}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Descargar Ticket
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
