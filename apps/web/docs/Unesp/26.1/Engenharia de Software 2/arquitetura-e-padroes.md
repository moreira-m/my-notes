# Arquitetura e Padrões de Projetos

## 1. Arquitetura Orientada a Mensagens (Publish/Subscribe e Filas)

Padrão: A arquitetura orientada a mensagens remove a comunicação direta entre componentes. Em vez de um cliente chamar o servidor sincronicamente, um serviço mediador (Broker ou Tópico/Fila) gerencia as mensagens. No modelo Publish/Subscribe, produtores (Publishers) publicam eventos no serviço, e múltiplos consumidores (Assinantes/Subscribers) são notificados de forma assíncrona. Em Java, a mecânica se apoia em polimorfismo e interfaces: o Broker mantém uma lista de objetos que implementam a interface *Assinante*. Quando um *Publicador* envia uma mensagem, o Broker itera sobre essa lista chamando o método *notify()* em cada objeto, sem saber ou se importar com qual classe concreta (ex.: sistema de contabilidade, marketing ou milhagens) está executando a ação.

Critérios de Escolha: 
1. Desacoplamento no Espaço e no Tempo: Clientes e servidores não precisam conhecer os endereços uns dos outros, nem precisam estar disponíveis (online) simultaneamente para que a comunicação ocorra.
2. Escalabilidade e Extensibilidade: Como visto no caso do sistema de Leilão (Bid Producer), usar Tópicos (Pub/Sub) ou Filas permite adicionar novos serviços (como Captura, Rastreamento e Análise de Lances) sem alterar o Produtor. O envio é assíncrono, liberando o cliente para continuar seu processamento imediatamente.

Implementação Robusta (Sistema de E-commerce):

```java
// Interface que garante o polimorfismo dos consumidores
public interface AssinanteEvento {
    void processarEvento(String mensagem);
}

// Implementações concretas e independentes (Polimorfismo)
public class SistemaDeMilhagens implements AssinanteEvento {
    @Override
    public void processarEvento(String mensagem) {
        System.out.println("Adicionando milhas devido ao evento: " + mensagem);
    }
}

public class SistemaDeFaturamento implements AssinanteEvento {
    @Override
    public void processarEvento(String mensagem) {
        System.out.println("Gerando nota fiscal para: " + mensagem);
    }
}

// O Serviço Mediador (Broker)
import java.util.ArrayList;
import java.util.List;

public class ServicoPublishSubscribe {
    private List<AssinanteEvento> assinantes = new ArrayList<>();

    public void assinar(AssinanteEvento assinante) {
        assinantes.add(assinante);
    }

    public void publicar(String mensagem) {
        // Notifica todos os assinantes via interface genérica (Baixo Acoplamento)
        for (AssinanteEvento assinante : assinantes) {
            assinante.processarEvento(mensagem);
        }
    }
}

// Classe Principal simulando o fluxo
public class ECommerceApp {
    public static void main(String[] args) {
        ServicoPublishSubscribe broker = new ServicoPublishSubscribe();
        broker.assinar(new SistemaDeMilhagens());
        broker.assinar(new SistemaDeFaturamento());

        // O sistema de vendas atua como Publicador
        System.out.println("Venda concluída. Publicando evento...");
        broker.publicar("Venda_ID_1001");
    }
}
```

Considere o sistema de leilão online onde o Bid Producer gera lances que devem ser processados por módulos de Análise, Rastreamento e Captura. Explique por que a adoção de uma arquitetura orientada a mensagem (utilizando tópicos) maximiza a escalabilidade e minimiza o acoplamento neste cenário, contrastando com uma arquitetura monolítica síncrona.
* Em uma arquitetura síncrona, o Bid Producer precisaria conhecer e chamar diretamente a interface de cada módulo destino, ficando bloqueado até que todos processassem o lance (alto acoplamento no espaço e no tempo). Na arquitetura orientada a mensagens via tópicos (Publish/Subscribe), o produtor apenas insere o evento no barramento e continua sua execução (desacoplamento no tempo). A infraestrutura notifica os módulos interessados de forma assíncrona. Isso reduz o acoplamento e permite escalar independentemente os consumidores ou adicionar novos sistemas leitores sem alterar nenhuma linha de código do produtor.

## Arquitetura Modelo-Visão-Controlador (MVC)

Padrão: A arquitetura MVC divide o sistema em três camadas bem definidas: o Modelo (encapsula as regras de negócio, estado e persistência no banco de dados), a Visão (funções específicas de interface gráfica e apresentação do conteúdo) e o Controlador (intercepta os eventos do usuário, gerencia a lógica de fluxo, invoca o modelo e seleciona a Visão como resposta). Em Java, um Controller recebe a requisição (ex: via HTTP), utiliza abstrações (interfaces do Model) para modificar dados e, dependendo do retorno, delega a renderização para uma tecnologia de View (como JSP ou HTML). O uso do polimorfismo e injeção de dependência no Controller permite trocar o banco de dados do Model sem afetar a lógica de roteamento.

Critérios de Escolha: A arquitetura MVC é recomendada principalmente para sistemas Web (frequentemente usando frameworks como Spring para Java, Ruby on Rails ou Django) por três razões:
1. Especialização do Trabalho: Permite que equipes distintas trabalhem no Front-end (Visão), Back-end (Controlador e lógicas do Modelo) e banco de dados (DBA) de forma isolada.
2. Reusabilidade: Classes de Modelo podem ser usadas simultaneamente por diferentes Visões (ex.: a mesma base de dados sendo exibida em um relógio analógico ou digital).
3. Testabilidade: Torna-se muito mais fácil isolar e testar os objetos não-visuais (Modelo e Controlador) sem a dependência de uma interface gráfica complexa.

Implementação Robusta (Sistema de Cadastro Web):

```java
// 1. Interface de Abstração do Modelo (Inversão de Dependência)
public interface IClienteRepositorio {
    void salvar(String nome);
    String obterCliente();
}

// 2. Modelo (Regras de negócio e persistência encapsuladas)
public class ClienteRepositorioBancoDados implements IClienteRepositorio {
    private String clienteRegistrado;
    @Override
    public void salvar(String nome) {
        // Lógica real de SQL ocorreria aqui
        this.clienteRegistrado = nome;
    }

    @Override
    public String obterCliente() {
        return this.clienteRegistrado;
    }
}

// 3. Visão (Responsável apenas pela apresentação estúpida)
public class ClienteView {
    public void renderizarPaginaSucesso(String nomeCliente) {
        System.out.println("<html><body><h1>Cadastro Sucesso!</h1>");
        System.out.println("<p>Bem-Vindo, " + nomeCliente + "</p></body></html>");
    }
}

// 4. Controlador (Orquestra o fluxo baseado na entrada do usuário)
public class ClienteController {
    // Controller depende da abstração IClienteRepositório, não da implementação concreta
    private IClienteRepositorio model;
    private ClienteView view;

    public ClienteController(IClienteRepositorio model, ClienteView view) {
        this.model = model;
        this.view = view;
    }

    public void processarRequisicaoCadastro(String nomeEntrada) {
        // O controlador atualiza o modelo
        model.salvar(nomeEntrada);

        // O controlador acessa o modelo atualizado e instrui a visão a renderizar
        String clienteSalvo = model.obterCliente();
        view.renderizarPaginaSucesso(clienteSalvo);
    }
}
```

No contexto de arquiteturas Web modernas, como o padrão MVC (Model-View-Controller) potencializa o Princípio de Inversão de Dependência (DIP) e facilita a organização do ciclo de vida de desenvolvimento de software em larga escala?
* O MVC divide logicamente a aplicação, separando o acesso e regras de negócio (Model) da camada de roteamento de eventos (Controller) e da renderização (View). Isso organiza o ciclo de vida ao permitir uma altíssima especialização do trabalho, onde desenvolvedores Front-end atuam na Visão sem interferir no Back-end. Quando o Controller depende do Model através de interfaces e abstrações (DIP), o acesso ao banco de dados pode ser alterado ou substituído (ex: de SQL para NoSQL) sem a necessidade de reescrever a lógica de roteamento do Controller ou o layout HTML da View, gerando código robusto, testável isoladamente e flexível à evolução tecnológica.

## Arquitetura de Microsserviços

Padrão: A arquitetura de microsserviços divide uma funcionalidade ampla em pequenas partes independentes. Diferente de um sistema monolítico, onde todos os módulos rodam no mesmo espaço de memória em tempo de execução, nos microsserviços cada nó (ou módulo) executa como um serviço único e autônomo (um processo separado). A comunicação não ocorre por instanciação direta de classes de outros domínios na memória local, mas sim através de interfaces bem definidas e desacopladas, tipicamente APIs HTTP/REST ou eventos em rede. Em Java, o polimorfismo arquitetural é obtido criando clientes HTTP (como *RestTemplate* ou *FeignClient* no Spring) injetados através de interfaces genéricas.

Critérios de Escolha: Contraste direto de monolito (onde os testes são lentos, burocráticos e uma falha em um módulo pode derrubar o sistema inteiro) com os microsserviços. Esta arquitetura é recomendada quando:
1. Agilidade e Implantação Independente: Necessidade de fazer deploys e testes em partes específicas do sistema sem precisar recompilar e re-testar o sistema inteiro.
2. Escalabilidade Flexível (Granular): Em vez de escalar o monolito inteiro, pode-se alocar servidores e escalar horizontalmente apenas o serviço sob maior estresse (ex: módulo de autenticação M1).
3. Resiliência: Se um serviço for construído de forma verdadeiramente autônoma e independente (sem compartilhar a base de dados), a falha de um não afetará o funcionamento em cadeia do restante da aplicação.
4. Tecnologias Heterogêneas: Como comunicam-se via API, um serviço pode ser escrito em Java e outro em Python, adaptando-se à melhor tecnologia para cada problema.

Implementação Robusta (Sistema Bancário / Autenticação):

```java
// O microsserviço A (ex: Controle de Contas) não conhece a tecnologia do Microsserviço B (Autenticação)
// Ele apenas conhece o contrato de comunicação (API)

// Interface de abstração do serviço externo
public interface IAutenticacaoServiceAPI {
    boolean verificarTokenValido(String token);
}

// Implementação que fará uma chamada de rede real via HTTP
public class AutenticacaoAPIClient implements IAutenticacaoServiceAPI {
    private String apiBaseUrl;

    public AutenticacaoAPIClient(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    @Override
    public boolean verificarTokenValido(String token) {
        System.out.println("Efetuando requisição de rede para: " + apiBaseUrl + "/validar");
        // Simula o retorno de uma requisição HTTP para outro microsserviço
        return token != null && token.equals("token_seguro_123");
    }
}

// Domínio local do microsserviço de Contas
public class ContaBancariaService {
    // Injeção de dependência via interface, cumprindo o DIP
    private IAutenticacaoServiceAPI authApi;

    public ContaBancariaService(IAutenticacaoServiceAPI authApi) {
        this.authApi = authApi;
    }

    public void realizarSaque(String tokenAcesso, double valor) {
        // Chamada de validação isolada. Se o serviço de Auth falhar,
        // pode-se tratar a tolerância a falhas aqui sem derrubar o sistema de saque.
        if (authApi.verificarTokenValido(tokenAcesso)) {
            System.out.println("Saque de R$" + valor + " liberado. Microsserviço se comunicando com sucesso");
        } else {
            System.out.println("Acesso negado pela API externa.");
        }
    }
}
```

Avalie o gargalo clássico da arquitetura monolítica no contexto de atualizações de software e estabilidade de tempo de execução, e justifique como a adoção da Arquitetura de Microsserviços soluciona essas questões, considerando a alocação de banco de dados e comunicação de processos.
* Em uma arquitetura monolítica, todos os módulos compartilham o mesmo espaço de endereçamento do processo operacional, o que significa que se um módulo crítico vazar memória ou travar, todo o sistema (o monolito) cai. Além disso, atualizar uma linha de código exige um deploy maciço e burocrático. Em microsserviços, cada processo roda como um serviço autônomo, provendo isolamento de falhas. Para manter a autonomia absoluta (e de acordo com as regras restritas de encapsulamento), cada microsserviço deve possuir sua própria base de dados (evitando leitura direta por tabelas alheias) e se comunicar estritamente via interfaces/APIs predefinidas. Isso permite que serviços altamente estressados sejam replicados independentemente (escalabilidade elástica) e atualizados sem interromper serviços paralelos, maximizando a agilidade.