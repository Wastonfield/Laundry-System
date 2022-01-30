from flask import Flask , render_template,jsonify, request, redirect,url_for, session
from pymongo import MongoClient
import bcrypt
from bson import json_util,ObjectId
import json


app = Flask(__name__)
client = MongoClient(host="localhost", port=27017)
database = client["LaundryMS"]
@app.route('/login')
@app.route('/', methods = ['GET','POST'])
def index():
    if request.method == 'POST' :
        user_name = request.form['username']
        user_pwd = request.form['userpwd']
        if user_name and user_pwd :
            user_exist = database.User.find_one({'user_name':user_name})
            #print(bcrypt.hashpw(user_exist['user_pwd'].encode('utf-8'),bcrypt.gensalt()))
            if user_exist['user_name'] == "admin" and user_exist['user_pwd'] == user_pwd:
            #bcrypt.hashpw(user_pwd.encode('utf-8'),bcrypt.gensalt()):
                session['username'] = user_name
                return redirect(url_for('admin_page'))
            else:
                if user_exist:
                    user_pwd_exist = database.User.find_one({'user_pwd':user_pwd})
                    return redirect(url_for('cashier_pos'))
    
    return render_template('index.html')

@app.route('/cashier-sales--pos')
def cashier_pos():
   # if 'username' in session:
        return render_template('cashier-sale-pos.html')

    #return redirect('login')

@app.route('/admin-page')
def admin_page():
    if 'username' in session:
        return render_template('admin.html')

    return redirect('login')

@app.route('/api/get-item-price')
def item_price():
        item_name = request.args.get('item-name')
        print(item_name)
        get_item_price = database["Item_Price"].find_one({'item_name':item_name})
        get_item_price_sanitized = json.loads(json_util.dumps(get_item_price))
        print(get_item_price_sanitized)
        return get_item_price_sanitized

@app.route('/api/make-sales',methods=['POST'])
def item_sales():
    if request.method == 'POST':
        sale_record = request.get_json()
        database['Sale_Record'].insert_one(sale_record).inserted_id
        print (sale_record)
        return jsonify(dict(redirect = url_for('check')))
        #return json.dumps(sale_record)

@app.route('/decret/<value>')
def decret(value):
    decret_value = bcrypt.hashpw(value.encode('utf-8'),bcrypt.gensalt())
    return decret_value

@app.route('/check')
def check():
    return render_template('check.html')

if __name__ == '__main__':
    app.secret_key = 'LMS-key'
    app.run(debug=True)