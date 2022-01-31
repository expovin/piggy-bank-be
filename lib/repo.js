const mariadb = require('mariadb');
const settings = require('../secrets');
const md5 = require('md5');

class REPO {
    
    constructor() {
        this.conn
    }

    init() {

        const pool = mariadb.createPool(settings.repo);
        pool.getConnection()
        .then ( conn => {
            console.log("Connected to DB!")
            this.conn=conn
        })
        .catch( error => console.log("Error connecting to MariaDb :"+error))   
    }

    getRole(email) {
        let sql="select a.descrizione as role, b.id as userId from KISS_TIPO_USERS a, KISS_USERS b where b.email='"+email+"' and a.id=b.tipo ";
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })             
    }

    getUserDetails(email) {
        let sql="select * from KISS_USERS where email ='"+email+"'";
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })     
    }

    getAmount(userId) {
        let sql="select * from MoneyPocket.KISS_SALDO where id_user="+userId;
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })     
    }


    getApprover(email) {
        let sql="select b.id_parent, b.relazione from KISS_USERS a, KISS_RELAZIONI b \
                        where a.email ='"+email+"' \
                        and a.id=b.id_child ";

        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })     
    }    
  
    getGoverned(email) {
        let sql="select b.*,c.nome, c.email , d.saldo \
                    from MoneyPocket.KISS_USERS a, MoneyPocket.KISS_RELAZIONI b,  MoneyPocket.KISS_USERS c, MoneyPocket.KISS_SALDO d \
                    where a.email ='"+email+"' \
                    and a.id=b.id_parent \
                    and b.id_child =c.id \
                    and c.id=d.id_user";

        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })     
    }    

    getGovernedTransactions(email, child_id) {
        let sql = "select d.* \
                    from MoneyPocket.KISS_USERS a, MoneyPocket.KISS_RELAZIONI b, MoneyPocket.KISS_TRANSAZIONI d \
                    where a.email ='"+email+"' \
                    and a.id=b.id_parent \
                    and b.id_child="+child_id + " and d.id_user="+child_id;
                    
        
        console.log(sql)

        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject("Error generating user lookup table ",error))                
        })                  
    }
    
    newTransaction(transazione) {
        let sql = "INSERT INTO KISS_TRANSAZIONI (ammontare, nota, id_user) Values ("+transazione.ammontare+",'"+transazione.nota+"',"+transazione.userId+")";
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject(error))                
        })        
    }

    approveTransaction(transactionId, approverId) {
        let sql="UPDATE KISS_TRANSAZIONI set id_approver="+approverId+" where id="+transactionId;
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject(error))                
        })     
    }

    getTransactions(idUser) {
        let sql="SELECT * from KISS_TRANSAZIONI where id_user="+idUser+" order by data";
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject(error))                
        })      
    }

    getTransactionsToApprove(idUser) {
        let sql= "select * from MoneyPocket.KISS_TRANSAZIONI  \
                    where id_user in (SELECT id_child from MoneyPocket.KISS_RELAZIONI where id_parent ="+idUser+") \
                    and id_approver = 0 ";
        return new Promise( (fulfill, reject) =>{
            this.conn.query(sql)
                .then(result => fulfill(result))
                .catch( error => reject(error))                
        })                      
    }
    

    checkPassword(userEmail, Password) {
    return new Promise((fulfill,reject) =>{
        let insert = "select count(*) as exist from MoneyPocket.Passwords where userId='"+this.UsersLookup[userEmail]+"' and Password='"+Password+"'"
        this.conn.query(insert)
            .then( result => fulfill({success:true, data:result}))
            .catch( error => console.log(error))                                
    })            
}
}

module.exports = REPO;