import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { schoolInfo } from '../mock/mockData';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">GADA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Gimnasio Americano del Atlántico</h1>
                <p className="text-xs text-gray-300">Sede 2 Manuela Beltrán</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Institución educativa comprometida con la formación integral de nuestros 
              estudiantes, brindando educación de calidad desde preescolar hasta 
              educación media.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/academics" className="text-gray-300 hover:text-white transition-colors">Académico</Link></li>
              <li><Link to="/admissions" className="text-gray-300 hover:text-white transition-colors">Admisiones</Link></li>
              <li><Link to="/student-life" className="text-gray-300 hover:text-white transition-colors">Vida Estudiantil</Link></li>
              <li><Link to="/athletics" className="text-gray-300 hover:text-white transition-colors">Deportes</Link></li>
              <li><Link to="/arts" className="text-gray-300 hover:text-white transition-colors">Artes</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                <p className="text-gray-300 text-sm">
                  Sede 2 Manuela Beltrán<br />
                  Atlántico, Colombia
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-300" />
                <p className="text-gray-300 text-sm">+57 (5) 000-0000</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-300" />
                <p className="text-gray-300 text-sm">info@gaa.edu.co</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Gimnasio Americano del Atlántico. {schoolInfo.copyright}.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;