import { Component, OnInit } from '@angular/core';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
	private transferform:FormGroup;
	public logs='';

  constructor(private formBuilder: FormBuilder,) { }

  ngOnInit() {

  	this.transferform = this.formBuilder.group({
            fromAddr: ['', Validators.required],
            toAddr: ['', Validators.required],
            amount: ['', Validators.compose([Validators.required,Validators.pattern('[0-9]*')])],
            secret: ['', Validators.required]
        });

  }

  async login(form){
  	this.logs+='<p>Submitting Form</p>';
  	let fromAddr = this.transferform.value.fromAddr;
    let toAddr = this.transferform.value.toAddr;
  	let amt= this.transferform.value.amount;
    let secretky= this.transferform.value.secret;
  	let response = await this.transfer(fromAddr, toAddr,amt,secretky);
  	console.log('response');

  }

  async transfer(fromAddr,toAddr,amount,secretky) {
          Tezos.setProvider({rpc: environment.network});
          Tezos.importKey(environment.inMemorySigner);

          try {
          const contract = await Tezos.contract.at(environment.contractAddress1);

          console.log("Printing contract methods...");
          console.log(contract.methods);
          console.log("Showing initial storage...");
          this.logs+='<p>Showing initial storage...</p>';
          this.logs+='<p>'+JSON.stringify(await contract.storage())+'</p>';
          console.log(await contract.storage())

          const op = await contract.methods.transfer(amount,fromAddr, toAddr).send()

          console.log('Awaiting confirmation...');
          this.logs+='<p>Awaiting confirmation...Please wait!</p>';
          await op.confirmation();
          console.log(op.hash, op.includedInBlock);
          this.logs+='<p>Tx Hash...'+op.hash+'</p>';
          return op.hash;

          } catch (ex) {
             console.log(ex)
          }
  }

}
