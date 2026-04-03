# Arquitetura Hexagonal (Ports and Adapters)

Coloca a regra de negócios no centro isolado do sistema, comunicando-se com tecnologias e infraestruturas (banco de dados, APIs, UI) exclusivamente através de portas (interfaces) e adaptadores (implementações concretas).

- Objetivo Principal (Desacoplamento): A arquitetura resolve as falhas do sistema em camadas tradicionais. A lógica de negócios não deve depender de nenhuma camada inferior ou tecnológica.
- Portas: Em vez de referenciar ferramentas externas, a camada de negócios define "portas". Uma porta é uma abstração que estipula o que o sistema precisa.
- Adaptadores: A camada externa de infraestrutura fornece os adaptadores. Eles são classes concretas (ex: SQLServerDB) que implementam as portas para falar com tecnologias específicas.
- Inversão e injeção: As portas abstratas são resolvidas nos adaptadores concretos através de injeção de dependência ou no momento da inicialização (bootstrapping).

Esse modelo se baseia nos mesmos princípios de Clean Architecture e Onion Architecture. É a escolha recomendada para sistemas que aplicam o Domain-Driven Design (DDD).

 | Vantagens              | Desvantagens |
 | :--------------------- | :----------- |
 | Separation of concerns | Complexidade |
 | Testabilidade          |              |
