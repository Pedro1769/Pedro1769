import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, Users, BookOpen, Trophy, Mail, Phone } from 'lucide-react';
import { INSTITUTIONAL_INFO } from '../../mockData';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
                  alt="Logo GAA"
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{INSTITUTIONAL_INFO.name}</h1>
                <p className="text-sm text-gray-600">"ESTUDIO, FE Y PROGRESO"</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Inicio</Link>
              <Link to="/admisiones" className="text-gray-700 hover:text-blue-600 transition-colors">Admisiones</Link>
              <Link to="/academico" className="text-gray-700 hover:text-blue-600 transition-colors">Académico</Link>
              <Link to="/contacto" className="text-gray-700 hover:text-blue-600 transition-colors">Contacto</Link>
              <Button 
                onClick={() => navigate('/login')} 
                className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white"
              >
                Portal Institucional
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              Tradición Educativa de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Excelencia
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {INSTITUTIONAL_INFO.subtitle}
              <br />
              {INSTITUTIONAL_INFO.subtitle2}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-8 py-3 text-lg"
              >
                Acceder al Sistema
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Conoce más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Programas</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una educación integral desde preescolar hasta media vocacional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-blue-800">Preescolar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Transición - Bases sólidas para el aprendizaje
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-green-800">Básica Primaria</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  1° a 5° - Desarrollo integral y creatividad
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-orange-800">Básica Secundaria</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  6° a 9° - Formación académica y personal
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-red-800">Media Vocacional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  10° y 11° - Preparación para el futuro
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-red-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-8">Información de Contacto</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Mail className="h-6 w-6" />
              <span className="text-lg">{INSTITUTIONAL_INFO.coordinator.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Phone className="h-6 w-6" />
              <span className="text-lg">{INSTITUTIONAL_INFO.coordinator.phone}</span>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-lg font-medium">{INSTITUTIONAL_INFO.coordinator.name}</p>
            <p className="opacity-90">{INSTITUTIONAL_INFO.coordinator.position}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">{INSTITUTIONAL_INFO.name}</h4>
              <p className="text-gray-300 mb-2">{INSTITUTIONAL_INFO.subtitle}</p>
              <p className="text-gray-300">{INSTITUTIONAL_INFO.subtitle2}</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Licencias</h4>
              {INSTITUTIONAL_INFO.licenses.map((license, index) => (
                <p key={index} className="text-gray-300 text-sm mb-1">{license}</p>
              ))}
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Identificación</h4>
              <p className="text-gray-300 text-sm mb-1">DANE: {INSTITUTIONAL_INFO.dane}</p>
              <p className="text-gray-300 text-sm">NIT: {INSTITUTIONAL_INFO.nit}</p>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 {INSTITUTIONAL_INFO.name}. Todos los derechos reservados a {INSTITUTIONAL_INFO.coordinator.name}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;