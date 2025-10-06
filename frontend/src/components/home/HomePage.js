import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, Users, BookOpen, Trophy, Mail, Phone, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const INSTITUTIONAL_INFO = {
    name: "GIMNASIO AMERICANO DEL ATLÁNTICO",
    subtitle: "PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA",
    subtitle2: "MEDIA VOCACIONAL COMERCIAL",
    licenses: [
      "LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002",
      "LICENCIA DE FUNCIONAMIENTO RES. 1557 DEL 7 DE SEPTIEMBRE DE 1.999"
    ],
    dane: "308758-001703",
    nit: "830.503.934-4",
    coordinator: {
      name: "Pedro Hurtado",
      position: "Coordinador Académico",
      email: "pedro_12hurbe@hotmail.com",
      phone: "3011968877"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-bl from-red-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-blue-300/5 to-red-300/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header mejorado */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 flex items-center justify-center shadow-lg">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
                    alt="Logo GAA"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-red-800 bg-clip-text text-transparent">
                    {INSTITUTIONAL_INFO.name}
                  </h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-full text-sm font-bold shadow-lg">
                    GADA
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">"ESTUDIO, FE Y PROGRESO"</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">Inicio</Link>
              <Link to="/admisiones" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">Admisiones</Link>
              <Link to="/academico" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">Académico</Link>
              <Link to="/contacto" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">Contacto</Link>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }} 
                data-testid="portal-institucional-btn"
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:from-blue-700 hover:via-blue-800 hover:to-red-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Portal Institucional
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section mejorado */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 transform hover:scale-105 transition-transform duration-700">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <h2 className="text-6xl font-bold text-gray-800 leading-tight">
                  Tradición Educativa de{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent animate-pulse">
                    Excelencia
                  </span>
                </h2>
                <div className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white rounded-2xl text-2xl font-bold shadow-2xl animate-bounce">
                  GADA
                </div>
              </div>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-6 rounded-full"></div>
            </div>
            
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
              <p className="text-xl text-gray-700 mb-2 font-medium leading-relaxed">
                {INSTITUTIONAL_INFO.subtitle}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {INSTITUTIONAL_INFO.subtitle2}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                type="button"
                size="lg" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                data-testid="acceder-sistema-btn"
                className="group bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:from-blue-700 hover:via-blue-800 hover:to-red-700 text-white px-10 py-4 text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <GraduationCap className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Acceder al Sistema
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 px-10 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Conoce más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section mejorado */}
      <section className="relative py-20 bg-gradient-to-r from-white/60 via-blue-50/30 to-red-50/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">Nuestros Programas</h3>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mb-4 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Ofrecemos una educación integral desde preescolar hasta media vocacional con excelencia académica
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Preescolar",
                description: "Transición - Bases sólidas para el aprendizaje",
                icon: GraduationCap,
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100"
              },
              {
                title: "Básica Primaria",
                description: "1° a 5° - Desarrollo integral y creatividad",
                icon: BookOpen,
                gradient: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100"
              },
              {
                title: "Básica Secundaria",
                description: "6° a 9° - Formación académica y personal",
                icon: Users,
                gradient: "from-orange-500 to-orange-600",
                bgGradient: "from-orange-50 to-orange-100"
              },
              {
                title: "Media Vocacional",
                description: "10° y 11° - Preparación para el futuro",
                icon: Trophy,
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100"
              }
            ].map((program, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-md transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${program.gradient}`}></div>
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${program.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                    <program.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className={`bg-gradient-to-r ${program.gradient} bg-clip-text text-transparent text-xl font-bold`}>
                    {program.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {program.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section mejorado */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h3 className="text-4xl font-bold mb-12">Información de Contacto</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-4 p-6 bg-white/10 rounded-2xl backdrop-blur-md">
              <Mail className="h-8 w-8 text-blue-200" />
              <span className="text-lg font-medium">{INSTITUTIONAL_INFO.coordinator.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-4 p-6 bg-white/10 rounded-2xl backdrop-blur-md">
              <Phone className="h-8 w-8 text-blue-200" />
              <span className="text-lg font-medium">{INSTITUTIONAL_INFO.coordinator.phone}</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-md max-w-md mx-auto">
            <p className="text-xl font-bold mb-2">{INSTITUTIONAL_INFO.coordinator.name}</p>
            <p className="text-blue-200 font-medium">{INSTITUTIONAL_INFO.coordinator.position}</p>
          </div>
        </div>
      </section>

      {/* Footer mejorado */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                {INSTITUTIONAL_INFO.name}
              </h4>
              <p className="text-gray-300 mb-3 leading-relaxed">{INSTITUTIONAL_INFO.subtitle}</p>
              <p className="text-gray-300 leading-relaxed">{INSTITUTIONAL_INFO.subtitle2}</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-blue-400">Licencias</h4>
              {INSTITUTIONAL_INFO.licenses.map((license, index) => (
                <p key={index} className="text-gray-300 text-sm mb-2 leading-relaxed">{license}</p>
              ))}
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-red-400">Identificación</h4>
              <p className="text-gray-300 text-sm mb-3">
                <span className="font-semibold">DANE:</span> {INSTITUTIONAL_INFO.dane}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold">NIT:</span> {INSTITUTIONAL_INFO.nit}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 {INSTITUTIONAL_INFO.name}. Todos los derechos reservados a {INSTITUTIONAL_INFO.coordinator.name}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;