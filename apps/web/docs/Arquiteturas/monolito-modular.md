# Monolito Modular

Sistema que possui um único local de implantaçao física (deploy em um único bloco), mas que internamente é rigorosamente dividido em fronteiras lógicas (módulos ou contextos) independentes, evitando que o código se torne grande ou caótico.

1. Fronteiras lóticas vs físicas: Enquanto microserviços separam o sistema fisicamente, o monolito modular separa o sistema logicamente através de namespaces, pacotes ou módulos dentro do mesmo código fonte.
2. O "maior monolito válido": Se voce modelar o seu dominio de negócios corretamente (usando Bounded Context do DDD), esse agrupamento se torna o maior monolito válido e sustentável. Protege a regra de negócios sem extrema complexidade de rede de um sistema distribuído.
3. Preparaçao para o futuro: Fronteiras verticais bem definidas tornam o monolito modular. Permite que seja extraído facilmente para um microserviço se for necessário.

