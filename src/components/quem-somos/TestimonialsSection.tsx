
interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  company: string;
}

const TestimonialCard = ({ quote, name, role, company }: TestimonialCardProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative">
      <div className="absolute -top-4 -left-4 h-10 w-10 bg-revgreen/20 rounded-full flex items-center justify-center">
        <span className="text-4xl text-revgreen">"</span>
      </div>
      <p className="text-gray-700 mb-6 italic">
        "{quote}"
      </p>
      <div className="flex items-center">
        <div className="mr-4">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-500">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "A RevHackers transformou completamente nossa abordagem de crescimento. Conseguimos aumentar as conversões em 230% em apenas 6 meses com as estratégias de ABM implementadas.",
      name: "Carlos Silva",
      role: "CMO",
      company: "TechSolutions"
    },
    {
      quote: "O que mais me impressionou foi a capacidade da equipe em transferir conhecimento. Agora temos autonomia para executar nossas campanhas com excelência.",
      name: "Mariana Costa",
      role: "Diretora de Marketing",
      company: "GrowthBiz"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            O que dizem sobre nós
          </h2>
          <p className="text-lg text-gray-600">
            Depoimentos de clientes que transformaram seus resultados com a RevHackers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              company={testimonial.company}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
