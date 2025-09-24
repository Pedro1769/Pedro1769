import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Users, BookOpen, Award, Globe } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Excelencia <span className="text-blue-200">Académica.</span>
                </h1>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Formación <span className="text-blue-200">Integral.</span>
                </h1>
              </div>
              <p className="text-xl text-blue-100 max-w-lg">
                Gimnasio Americano del Atlántico - Sede 2 Manuela Beltrán. 
                Institución educativa comprometida con la formación integral desde 
                preescolar hasta educación media.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    Sistema Académico
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/admissions">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                    Admisiones
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_6/v1693919082/cngedu/ytp9jrmlmh2kw2ykhy3i/PS.jpg"
                alt="Estudiantes CNG"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Academic Levels Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Programas Académicos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos una educación integral desde preescolar hasta bachillerato, 
              formando estudiantes competentes y con valores sólidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Elementary */}
            <Card className="group hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <img 
                    src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_6/v1693919082/cngedu/ytp9jrmlmh2kw2ykhy3i/PS.jpg"
                    alt="Primaria"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Básica Primaria</h3>
                <p className="text-gray-600 mb-6">
                  Fundamentos sólidos para el aprendizaje. Grados 1° a 5° con enfoque 
                  en desarrollo integral y bilingüismo.
                </p>
                <Link to="/academics/elementary">
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white">
                    Conocer Más
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Middle School */}
            <Card className="group hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <img 
                    src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_6/v1693917871/cngedu/n96v86uaitfjlrhoswbh/MS.jpg"
                    alt="Secundaria"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Básica Secundaria</h3>
                <p className="text-gray-600 mb-6">
                  Fortalecimiento académico y desarrollo de competencias. 
                  Grados 6° a 9° preparando para la media vocacional.
                </p>
                <Link to="/academics/middle">
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white">
                    Conocer Más
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* High School */}
            <Card className="group hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <img 
                    src="https://resources.finalsite.net/images/f_auto,q_auto/v1694441517/cngedu/efbcf0amt9matjif0ipa/HS_Homepage_02.png"
                    alt="Media Vocacional"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Media Vocacional</h3>
                <p className="text-gray-600 mb-6">
                  Preparación universitaria con enfoque en liderazgo global. 
                  Grados 10° y 11° con doble titulación.
                </p>
                <Link to="/academics/high">
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white">
                    Conocer Más
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Excelencia Académica y Desarrollo Integral
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Educación de Calidad</h3>
                    <p className="text-gray-600">
                      Metodologías pedagógicas innovadoras y personal docente calificado.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Formación Integral</h3>
                    <p className="text-gray-600">
                      Desarrollo académico, deportivo, artístico y de valores humanos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Preparación para el Futuro</h3>
                    <p className="text-gray-600">
                      Formamos estudiantes preparados para los desafíos del siglo XXI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://resources.finalsite.net/images/f_auto,q_auto/v1693918995/cngedu/uwukvag6brfns0k73qzs/PROFESOR-CON-ESTUDIANTES-2.jpg"
                alt="Profesor con estudiantes"
                className="rounded-lg shadow-lg"
              />
              <img 
                src="https://resources.finalsite.net/images/f_auto,q_auto/v1688541906/cngedu/tbkvyi00gc2fzwrkfuuy/Rectangle31.png"
                alt="Innovación educativa"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-200">1°-11°</div>
              <p className="text-blue-100">Grados Académicos</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-200">500+</div>
              <p className="text-blue-100">Estudiantes</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-200">15+</div>
              <p className="text-blue-100">Años de Experiencia</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-200">95%</div>
              <p className="text-blue-100">Éxito Académico</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para Ser Parte de Nuestra Comunidad?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Descubre cómo podemos ayudar a tu hijo a alcanzar su máximo potencial 
            académico y personal en un ambiente internacional de excelencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admissions">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Proceso de Admisión
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Agendar Visita
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;