import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="https://resources.finalsite.net/images/v1693982454/cngedu/lpk3z7buhakp2sbsruyq/GNG-fullwhite1.svg" 
              alt="Colegio Nueva Granada" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 mb-4 max-w-md">
              Como una escuela internacional K4-12, CNG es una comunidad de aprendizaje 
              comprometida con servir a una población diversa y preparar ciudadanos 
              globales responsables.
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
                  Carrera 9 No. 132-32<br />
                  Bogotá, Colombia
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-300" />
                <p className="text-gray-300 text-sm">+57 (1) 274-7000</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-300" />
                <p className="text-gray-300 text-sm">info@cng.edu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Colegio Nueva Granada. Todos los derechos reservados.
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