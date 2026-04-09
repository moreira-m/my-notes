# Conceitos de Projetos

## Tópico 1: Projeto e Qualidade de Software

### Atributos (FURPS)

- Esta é a **fase de blueprint (plano detalhado)** onde os **requisitos abstratos** são traduzidos em um **modelo estruturado** que estabelece como o sistema será construído e garante sua qualidade.
- Envolve a modelagem do sistema **antes do início do código**.
- **FURPS** inclui:
  1.  **Funcionalidade (Functionality)**: capacidades e recursos do software.
  2.  **Usabilidade (Usability)**: fatores humanos, estética, consistência da interface do usuário (UI) e documentação.
  3.  **Confiabilidade (Reliability)**: frequência de falhas (tempo médio para falha - **MTTF**) e a gravidade dessas falhas.
  4.  **Desempenho (Performance)**: eficiência, consumo de recursos e tempos de resposta.

---

## Tópico 2: O Modelo e o Processo de Projeto

*   Como a planta de um arquiteto, comece com uma **visão geral de alto nível** do sistema e, em seguida, **aprofunde-se iterativamente** para definir:
    *   **Interfaces** específicas
    *   **Componentes**
    *   **Estruturas de dados**
    *   Esta abordagem utiliza **UML** para a tradução em um **modelo de análise**.
    *   O modelo deve ser **legível** e **fácil de entender**.
    *   O processo de desenvolvimento é **iterativo**.

*   Mesmo os **métodos ágeis** não eliminam a necessidade de **projeto (design)**; o **código por si só** raramente é **documentação suficiente** para a **manutenção** futura.

*   O **processo de projeto** envolve **tarefas sistemáticas e genéricas** que fazem a transição do sistema de uma **alta abstração** para uma **baixa abstração**, mapeando **elementos de análise** para **elementos de projeto**.
    *   **Projetos de dados/classes** traduzem-se em **Elementos Arquiteturais**.
    *   **Elementos comportamentais de cenário** traduzem-se em **Elementos de Interface** e **Elementos de Componente**.
    *   **O domínio do processo** envolve:
        *   **Particionar** o modelo de análise em um **subsistema funcionalmente coeso**.
        *   **Projetar interfaces** para dispositivos externos.
        *   **Desenvolver um modelo de implantação (deployment)**.

---

## Tópico 3: Abstração e Arquitetura

*   **Abstração** simplifica a complexidade ao ocultar os detalhes granulares de uma função.
*   **Arquitetura** define a organização estrutural de alto nível e a interação desses componentes abstraídos.

### Abstração

*   **Abstração**: Nomear uma sequência de instruções sem mostrar os detalhes.
    *   Exemplo: A palavra "abrir" implica caminhar, esticar o braço, agarrar e girar.
*   Existe em **histórias de usuário**, **casos de uso** e **pseudocódigo**.

### Arquitetura

*   **Arquitetura**: A organização dos **módulos do programa**, suas **estruturas de dados** e como eles **interagem**.

### Princípios de Arquitetura Ágil

*   No **Ágil**, a **arquitetura** deve ser definida **logo no início**.
    *   O **desenvolvimento incremental** da **arquitetura** raramente é bem-sucedido.

### Conceito-Chave: Refatoração

*   A **refatoração de componentes** é **barata**.
*   A **refatoração arquitetural** é **catastrófica**.

---

## Tópico 4: Modularidade, Encapsulamento e Separação de Interesses

*   **Problemas complexos** são resolvidos ao:
    *   Dividi-los em **módulos separados e independentes**, o que exemplifica a **Separação de Interesses (Separation of Concerns)**.
    *   Estes módulos são então **envolvidos em limites estritos**, permitindo a comunicação apenas através de **interfaces específicas**, que é a essência do **Encapsulamento**.

### Separação de Interesses
*   Uma estratégia de **dividir para conquistar**.

### Modularidade
*   O único atributo que torna o software **intelectualmente gerenciável**.

### Encapsulamento
*   Protege **dados e métodos internos** contra **interferências externas**.

### Modularidade e Considerações de Custo

*   À medida que o **número de módulos aumenta**:
    *   O **custo por módulo individual diminui**.
    *   No entanto, o **custo de integração** entre esses módulos **aumenta simultaneamente**.
*   Além disso, o **encapsulamento estrito** garante que, quando ocorrem **erros** durante os **testes** ou a **manutenção**:
    *   A **propagação de bugs** é **fisicamente limitada**.
    *   Isso **evita falhas em cascata no sistema**.

### Relação Custo-Módulo

*   A relação entre o **custo** e o **número de módulos** normalmente forma uma curva em forma de U.
    *   Inicialmente, mais módulos levam a custos unitários menores.
    *   Além de um ponto ideal, o aumento de módulos faz com que os custos totais subam devido à maior complexidade de integração.

---

## Tópico 5: Independência Funcional (Coesão vs. Acoplamento)

*   **Módulos de alta qualidade** devem:
    *   Fazer exatamente **uma coisa muito bem** (**Alta Coesão**).
    *   Depender o **mínimo possível** de outros módulos para fazê-la (**Baixo Acoplamento**).

### Conceitos-Chave

*   **Coesão**:
    *   Refere-se à **robustez funcional**.
    *   Sua descrição **não deve conter** as palavras "e" ou "exceto".
*   **Acoplamento**:
    *   Descreve a **interdependência relativa** entre os módulos.

### Regra de Ouro

*   **Alta Coesão** (propósito único e focado) + **Baixo Acoplamento** (mínimas dependências externas) = **Software Robusto**.

---

## Tópico 6: Refatoração

- Um **processo rigoroso** de **limpeza** e **otimização da estrutura interna do código**.
  - Isso é feito **sem alterar o comportamento externo ou a saída do sistema**.

- **Elimina**:
  - **Redundância**
  - **Algoritmos ineficientes**
  - **Estruturas de dados mal construídas**

- **Simplifica o projeto**.
  - No entanto, carrega o **risco de efeitos colaterais involuntários**.

### Refatoração Preparatória

- Às vezes, você deve **reestruturar o código primeiro** para **tornar a adição de um novo recurso mais fácil**.


---
---
---

# Projeto de Software

## Abstração

Explicação Conceitual: A abstração é o mecanismo de simplificar um elemento complexo, nomeando uma sequência de instruções ou dados, omitindo os detalhes internos de como aquilo funciona. Analogia do mundo real: Dirigir um carro. Você utiliza a abstração "acelerar" ao pisar no pedal. Você não precisa saber a quantidade exata de mililitros de combustível sendo injetada nos cilindros ou a temporização da faísca da vela. A complexidade do motor é abstraída para uma interface simples.

Problema: Quando ignoramos a abstração, expomos detalhes de baixo nível (lógica de implementação) para as camadas de alto nível (regras de negócio). O código torna-se frágil, poluído e extremamente difícil de ler, pois o desenvolvedor precisa lidar com uma carga cognitiva massiva para entender o que uma simples rotina faz.

Código Ruim (Detalhes Expostos)
```java
public class Cafeteria {
    public void aquecerAgua() {System.out.println("Aquecendo a 90 graus");}
    public void moerGraos() {System.out.println("Moendo 15g de café");}
    public void passarAgua() {System.out.println("Passando água pelo filtro");}
}
```

Código Refatorado (Alta Abstração)
```java
public class Cafeteria {
    public void fazerCafe() {
        aquecerAgua();
        moerGraos();
        passarAgua();
    }

    private void aquecerAgua() {System.out.println("Aquecendo a 90 graus");}
    private void moerGraos() {System.out.println("Moendo 15g de café");}
    private void passarAgua() {System.out.println("Passando água pelo filtro");}
}
```

Correlacionando abstração com Encapsulamento: É possível existir Abstração sem Encapsulamento em um projeto de Software?
* A abstração foca na visão conceitual externa de um componente (o "o quê" ele faz), enquanto o encapsulamento é o mecanismo arquitetural que impõe e protege essa abstração, ocultando os dados e detalhes procedurais (o "como" ele faz). É possível conceber uma abstração sem encapsulamento (ex.: um método com um bom nome, mas que manipula variáveis globais públicas), porém o vazamento de informações destruirá a robustez do projeto, tornando a abstração inútil e frágil.


## Modularidade

Explicação conceitual: A modularidade é a manifestação da "separação de interesses", dividindo o sistema em componentes (módulos) independentes e localizáveis que, juntos, satisfazem os requisitos do problema. Segundo Meyer, é o único atributo que torna o software "intelectualmente gerenciável". Analogia do mundo real: Construir uma casa utilizando cômodos (módulos) delimitados por paredes. Se você precisar reformar o encanamento do banheiro, não precisará quebrar o piso do quarto e da sala.

Problema: Sistemas não modulares tornam-se "Monólitos" ("Big Ball of Mud"). No entanto, ignorar o equilíbrio matemático da modularidade também é fatal: se você dividir o sistema em módulos minúsculos em excesso, o custo de desenvolver cada módulo cai, mas o custo de integração entre eles dispara, aumentando o custo total do software.

Código Ruim (Monolítico):
```java
public class SistemaLoja {
    // Ruim: único módulo gigante lidando com interesses completamente diferentes
    public void processarPedido() {
        System.out.println("Validando estoque no banco de dados...");
        System.out.println("Calculando impostos...");
        System.out.println("Gerando PDF do recibo...");
    }
}
```

Código Refatorado (Modularizado):
```java
public class ServicoDePedidos {
    // 1. Módulos independentes são instanciados ou injetados.
    private Estoque estoque = new Estoque();
    private CalculadoraDeImpostos impostos = new CalculadoraDeImpostos();
    private GeradorDeRecibo recibo = new GeradorDeRecibo();

    public void processarPedido() {
        // 2. O fluxo delega as funções para módulos separadamente gerenciáveis.
        estoque.validar();
        impostos.calcular();
        recibo.gerarPDF();
    }
}
```

Relação entre Modularidade e Custo de Software: Por que o paradigma de Microsserviços desafia o ponto "M" (região de custo mínimo) da curva de modularidade clássica proposta por Pressman? 
* A curva clássica de Pressman demonstra que dividir um sistema diminui o custo individual do módulo, mas eleva os custos de integração (formando um "U" de custo total). Microsserviços impulsionam o sistema para o lado direito da curva (muitos módulos), elevando criticamente a complexidade de integração, testes de rede e orquestração. O sucesso desse paradigma exige infraestrutura robusta, automação de integração e APIs impecáveis para compensar esse aumento brutal no custo de interconexão.

![Curva de Modularidade](/img/curva-modularidade.png)


## Encapsulamento

Explicação conceitual: O encapsulamento restringe o acesso aos dados internos e detalhes procedurais de um componente, obrigando que toda comunicação externa aconteça estritamente através de interfaces públicas bem definidas. Analogia do mundo real: Um caixa eletrônico. Seu dinheiro está lá dentro, mas a máquina blinda o cofre. Você não manipula as notas diretamente; você pede à interface da máquina (senha, botões) para sacar, e ela executa o processo com segurança.

Problema: A quebra do encapsulamento cria as chamadas "backdoors" (portas dos fundos). Conforme o famoso decreto de Jeff Bezos (2002), acessar diretamente o banco de dados ou variáveis de outra equipe gera efeitos colaterais severos. Se a equipe A alterar sua estrutura de dados interna, o sistema da equipe B, que lia aqueles dados indevidamente, irá quebrar imediatamente.

Código Ruim (Ocultamento Violado):
```java
public class ContaBancaria {
    // Ruim: acesso direto e irrestrito ao estado interno da classe.
    public double saldo;
}
```

Código Refatorado (Proteção por Interface):
```java
public class ContaBancaria {
    // 1. Os dados escondidos (private), blindando a estrutura interna.
    private double saldo;

    // 2. O acesso externo ocorre apenas por operações autorizadas e validadas.
    public void depositar(double valor) {
        // 3. Regras de negócio podem proteger o estado interno.
        if (valor > 0) {
            this.saldo += valor;
        }
    }

    public double getSaldo() {
        return this.saldo;
    }
}
```

Correlacione o Encapsulamento com o Princípio Aberto-Fechado (OCP - Open-Closed Principle). Como o primeiro atua como pré-requisito técnico absoluto para o sucesso do segundo?
* O OCP afirma que um módulo deve ser aberto para extensão, mas fechado para modificação de código existente. Para que o comportamento de um módulo possa ser estendido com segurança via novas interfaces sem quebrar clientes existentes, seu estado interno e algoritmos fundamentais devem estar fisicamente protegidos contra manipulações externas. Sem encapsulamento forte, qualquer tentativa de extensão poderia corromper acidentalmente o estado compartilhado, violando a premissa de que as adições são "seguras e livres de modificação do núcleo".

## Coesão

Explicação conceitual: Coesão é a indicação da "robustez funcional" de um módulo; mede o quão focado o módulo é em fazer uma, e apenas uma, coisa de forma excelente. O ideal é a "Coesão Funcional". Analogia do mundo real: Uma faca de chef japonesa. Ela foi projetada excepcionalmente bem para uma única tarefa: cortar alimentos. Um canivete suíço, por outro lado, faz dezenas de coisas, mas nenhuma com o máximo de precisão ou resistência (baixa coesão).

Problema: Módulos com baixa coesão costumam ser descritos usando palavras como "E" ou "EXCETO". Um componente "esquizofrênico" que tenta fazer cálculo de folha de pagamento e impressão de relatórios torna-se enorme, complexo para realizar manutenção e exige testes regressivos gigantescos sempre que uma das funções muda.

Código Ruim (Componente Esquizofrênico):
```java
public class CalculadoraMatematica {
    // Ruim: Um método fazendo múltiplas coisas logicamente distintas
    public double sin_or_cos(double x, int op) {
        if (op == 1) { return Math.sin(x); }
        else { return Math.cos(x); }
    }
}
```

Código Refatorado (Coesão Funcional):
```java
public class CalculadoraMatematica {
    // 1. Cada método agora faz exclusivamente uma única operação matemática.
    public double sin(double x) {
        return Math.sin(x);
    }

    // 2. A separação permite testar, alterar ou reutilizar funções de forma independente.
    public double cos(double x) {
        return Math.cos(x);
    }
}
```

Explique como a Coesão está intrinsecamente ligada ao Princípio da Responsabilidade Única (SRP - Single Responsibility Principle). Utilize o conceito de "razões para mudar".
* A Coesão avalia se um módulo agrupa tarefas afins. O SRP formaliza isso exigindo que "toda classe deve ter uma e apenas uma razão para mudar". Se uma classe tem baixa coesão (ex: lida com cálculos tributários e envio de e-mails), ela possui múltiplas razões para ser alterada (seja por leis fiscais ou por provedores de e-mail). Aumentar a coesão divide a classe em duas, garantindo a conformidade com o SRP.

## Acoplamento

Explicação conceitual: Acoplamento é a medida qualitativa do grau de interdependência entre as classes ou módulos do seu sistema. Projetos modernos exigem o mínimo de acoplamento possível para evitar reações em cadeia durante falhas. Analogia do mundo real: Peças soldadas vs. Peças parafusadas. Se o motor do carro for soldado ao chassi (alto acoplamento), você precisará destruir parte do carro para trocar o motor. Se for conectado por suportes e parafusos padronizados (baixo acoplamento via interface), a substituição é limpa.

Problema: Alto acoplamento resulta em um "efeito dominó" de bugs. Um exemplo clássico das suas aulas é o Acoplamento de Conteúdo, no qual a Classe A acessa e lê o arquivo físico diretamente usado pela Classe B. Qualquer mudança no tipo do arquivo gerará um colapso em ambas as classes.

Código Ruim (Acoplamento forte a recursos físicos compartilhados):
```java
class A {
    private void f() {
        // Ruim: A classe A está intimamente ligada à infraestrutura e dados do arquivo
        File arq = File.open("arq1.db");
        int total = arq.readInt();
    }
}
```

Código Refatorado (Baixo acoplamento via Interfaces/Métodos Públicos):
```java
class A {
    // 1. A Classe A recebe uma instância de B, conversando através de uma assinatura pública limpa.
    private void f(B b) {
        // 2. A Classe A desconhece se os dados vêm de arquivo, banco de dados ou rede.
        int total = b.getTotal();
    }
}

class B {
    private int total;
    // 3. A Classe B encapsula o mecanismo complexo de leitura e entrega apenas o resultado atômico
    public int getTotal() {
        return this.total;
    }
    // ... lógica do arquivo db escondida aqui dentro
}
```

Correlacione os conceitos de Baixo Acoplamento e o Princípio da Inversão de Dependência (DIP - Dependency Inversion Principle). Como a DIP atua preventivamente contra a "reação em cadeia" de erros em sistemas de software?
* O baixo acoplamento busca minimizar conexões diretas entre componentes. O DIP fornece a técnica definitiva para isso, declarando que "classes de alto nível não devem depender de classes de baixo nível, mas sim de abstrações (interfaces)". Ao forçar componentes a conversarem unicamente por interfaces genéricas, uma mudança na classe concreta (detalhe) jamais afetará o chamador (abstração), cortando pela raiz o efeito dominó ou a reação em cadeia temida no alto acoplamento físico.