'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface InventarioAgotadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoCombustible: string;
}

export default function InventarioAgotadoModal({ isOpen, onClose, tipoCombustible }: InventarioAgotadoModalProps) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white">
                      <FiAlertTriangle className="h-6 w-6 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold">Inventario Agotado</h3>
                        <p className="text-red-100 text-sm">Sin disponibilidad de combustible</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-red-200 transition-colors"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="text-center">
                    {/* Icono grande */}
                    <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <FiAlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    {/* Mensaje principal */}
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      ¡Sin Disponibilidad!
                    </h4>
                    
                    <p className="text-gray-600 mb-4">
                      Lo sentimos, actualmente no hay <strong>{tipoCombustible}</strong> disponible en el inventario.
                    </p>

                    {/* Información adicional */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        </div>
                        <div className="ml-3 text-left">
                          <h5 className="text-sm font-medium text-yellow-800">
                            ¿Qué puedes hacer?
                          </h5>
                          <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                            <li>• Intenta más tarde cuando se reabastezca el inventario</li>
                            <li>• Contacta al administrador para más información</li>
                            <li>• Verifica si hay otro tipo de combustible disponible</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>📞 Contacto:</strong> Si necesitas asistencia inmediata, 
                        contacta al administrador del sistema.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4">
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Entendido
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
