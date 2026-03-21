# Arquitetura Hexagonal (Ports and Adapters)

Coloca a regra de negócios no centro isolado do sistema, cominicando-se com tecnologias e infraestruturas (banco de dados, APIs, UI) exclusivamente através de portas (interfaces) e adaptadores (implementaçoes concretas).

- Objetivo Principal (Desacoplamento): A arquitetura resolve as falhas do sistema em camdas tradicionais. A lógica de negócios nao deve depender de nenhuma camada inferior ou tecnológica.
- Portas: Em vez de referenciar ferramentas externas, a camada de negócios define "portas". Uma porta é uma abstraçao que estipula o que o sistema precisa.
- Adaptadores: A camada externa de infraestrutura fornece os adaptadores. Eles sao classes concretas (ex: SQLServerDB) que implementam as portas para falar com tecnologias especificas.
- Inversao e injeçao: As portas abstratas sao resolvidas nos adaptadores concretos através de injeçao de dependencia ou no momento da inicializaçao (bootstrapping).

Esse modelo se baseia nos mesmos princípios de Clean Architecture e Onion Architecture. É a escolha recomendada para sistemas que aplicam o Domain-Driven-Design (DDD)

 | Vantagens              | Desvantagens |
 | :--------------------- | :----------- |
 | Separation of concerns | Complexidade |
 | Testabilidade          |