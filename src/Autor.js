import $ from "jquery";
import CustomInputText from './componentes/CustomInputText'
import CustomSubmit from './componentes/CustomSubmit'
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import TratadorDeErros from './TratadorDeErros'

class FormularioAutor extends Component {

	
  constructor() {   
    super(); 
    this.state = {nome: '', email: '', senha: ''};
    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);    
  }  

  setNome(e) {
    this.setState({nome: e.target.value});    
  }

  setEmail(e) {
    this.setState({email: e.target.value});
  }

  setSenha(e) {
    this.setState({senha: e.target.value});
  }  

  handleSubmit(e) {
    e.preventDefault();
    var nome = this.state.nome.trim();
    var email = this.state.email.trim();
    var senha = this.state.senha.trim();    

    $.ajax({
      url: "http://localhost:8080/api/autor",
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify({nome:nome,email:email,senha:senha}),
      success: function(data) {
        PubSub.publish( 'atualiza-lista-autores', data );
        PubSub.publish( 'limpa-erros', {});
        this.setState({nome:'',email:'',senha:''});
      }.bind(this),
      error: function(response){
        if(response.status === 400){
          new TratadorDeErros().publicaErros(JSON.parse(response.responseText));
        }
      }
    });    
  }    		
	

	render() {
		return (
              <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.handleSubmit}>
                  <CustomInputText id="nome" name="nome" label="Nome: " type="text" value={this.state.nome} placeholder="Nome do Autor" onChange={this.setNome} />
                  <CustomInputText id="email" name="email" label="Email: " type="text" value={this.state.email} placeholder="Email do Autor" onChange={this.setEmail} />
                  <CustomInputText id="senha" name="senha" label="Senha: " type="password" value={this.state.senha} placeholder="Senha do Autor" onChange={this.setSenha}/>
                  <CustomSubmit label="Enviar" />
                </form>

              </div>  			
		);
	}
}

class TabelaAutores extends Component {
	render(){
         return (<div>            
            <table className="pure-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>email</th>
                </tr>
              </thead>
              <tbody>
                  {
                    this.props.lista.map(function(autor){
                      return (
                          <tr key={autor.id}>
                            <td>{autor.nome}</td>                
                            <td>{autor.email}</td>                                              
                          </tr>
                      );
                    })}                    
              </tbody>
            </table> 
          </div>);             		
	}
}

export class AutorBox extends Component {

	constructor() {   
	   super(); 
	   this.state = {lista : []};	   
	}

  componentDidMount() {
    $.ajax({
      url: "http://localhost:8080/api/autor/lista",
      dataType: 'json',
      success: function(data) {
        this.setState({lista: data});
      }.bind(this)
    });

	PubSub.subscribe('atualiza-lista-autores', function(topico,novaLista){
		this.setState({lista:novaLista});
	}.bind(this));    
  }    	  

	render(){
		return (<div>
			<FormularioAutor/>
			<TabelaAutores lista={this.state.lista}/>
		</div>);
	}
}
