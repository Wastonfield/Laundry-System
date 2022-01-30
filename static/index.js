/* declaration of item category constant*/
const _MEN_ = "Men";
const _WOMEN_ = "Women";
const _KIDS_ = "Kids";
const _OTHERS_ = "Others";

/* class that store array of items*/
const _Item = {
    _sale_date: "",
    _sale_time: "",
    _item_s: [],
    _total_price:0
}

let total = 0;
//This function is use to to check the existence of an item and update the item list
function updateList(name,category,price){
    if($('.list-items').children().length < 1){
        addToList(name,category,price);
        total_Price(price);
    }
    else{
        if(searchFor_listChild(name,category) == undefined){
            addToList(name,category,price);
            total_Price(price);
        }
        else{
            const element_index = searchFor_listChild(name,category);
            let element = $('.list-items').children().eq(element_index);
            let new_qty = $(element).children('.item-details').prev().text();
            let new_price = $(element).children('.item-details').next().text();
            $(element).children('.item-details').prev().text(parseInt(new_qty) + 1);
            $(element).children('.item-details').next().text(parseInt(new_price) + price);
            total_Price(price);
        }
        //searchFor_listChild(name,category);
    }
}

function getItemPrice(item_name,item_category_name){
    $.ajax({
        type: 'GET',
        url:'/api/get-item-price?item-name=' + item_name,
        success: function(data){
            let get_item_price = JSON.parse(JSON.stringify(data));
            updateList(item_name,item_category_name,get_item_price.item_price);
        },
        error: function(err){
            alert(err);
            }
    });
}

function addToList(name,category,price){
    let html = "<div class='item'><div class='qty'>" + 1 + "</div><div class='item-details'><span>" +
                name + "</span><span>" + category + "</span></div><div class='item-price'>"+ price +
                "</div><div class='add-remove-item'><span class='remove-item'></span>"+
                "<span class='add-item'></span></div></div>";
            $('.list-items').append(html);
}

function searchFor_listChild(name,category){
    let index = undefined;
    if($('.list-items').children().length >= 1){
        $('.list-items').children('.item').each(function(i){
            const el_child1 = $(this).children('.item-details').children().first().text();
            const el_child2 = $(this).children('.item-details').children().last().text(); 
            if(el_child1 == name && el_child2 == category){
                index = i;
                return false;
            } 
        });
    }
    return index;
}

function removeItem(element){
    let new_qty = $(this).parent().siblings('.qty').text();
    let price = $(this).parent().siblings('.item-price').text();
    if(parseInt(new_qty) == 1){
        $(this).parents('.item').remove();
        total_Price(-(parseInt(price) / parseInt(new_qty)));
    }else{
        $(this).parent().siblings('.qty').text(parseInt(new_qty) - 1);
        $(this).parent().siblings('.item-price').
        text(((parseInt(price)-(parseInt(price) / parseInt(new_qty)))));
        total_Price(-(parseInt(price) / parseInt(new_qty)));
    }
}
function addItem(element){
    let new_qty = $(this).parent().siblings('.qty').text();
    let price = $(this).parent().siblings('.item-price').text();
    $(this).parent().siblings('.qty').text(parseInt(new_qty) + 1);
        $(this).parent().siblings('.item-price').
        text(((parseInt(price) + (parseInt(price) / parseInt(new_qty)))));
        total_Price((parseInt(price) / parseInt(new_qty)));
}

function total_Price(price){
    total = total + price;
    $('.total-price').text(total);
}

function getItemList(sale_date,sale_time,total_price){
    $('.list-items').children('.item').each(function(){
        const item_qty = $(this).children().eq(0).text();
        const item_name = $(this).children().eq(1).children().first().text() + "(" + $(this).children().eq(1).children().last().text() + ")";
        const item_price = $(this).children().eq(2).text();
        add_to_array_Items(item_name,item_qty,item_price);
    });
    _Item._sale_date = sale_date;
    _Item._sale_time = sale_time;
    _Item._total_price = parseInt(total_price);
    
}

function add_to_array_Items(item_name,item_qty,item_price){
    let item ={
        _item_name : item_name,
        _item_qty : item_qty,
        _item_price : item_price
    }
    _Item._item_s.push(item);
}

//all event goes here
$(document).ready(function(){
    var animation = bodymovin.loadAnimation({
        container:document.getElementById('ani1'),
        renderer: 'svg',
        loop: true,
        autoplay:true,
        path: 'static/circles-menu-1.json'
    });
    $('#test').click(function(){
        alert("welcome");
    });
    $('#menu-icon').click(function(){
        $('.pos-menu').toggleClass('hide-menu');
    });

    var dt = new Date();
    $('#datepicker').val(dt.getDate() + "/" + (dt.getMonth() + 1) + "/"+ dt.getFullYear());

    $('#tab-men').click(function(){
        $('#pos-p-2').addClass('hide');
        $('#pos-p-3').addClass('hide');
        $('#pos-p-1').removeClass('hide');
    });

    $('#tab-women').click(function(){
        $('#pos-p-1').addClass('hide');
        $('#pos-p-3').addClass('hide');
        $('#pos-p-2').removeClass('hide');
    });
    $('#tab-kids').click(function(){
        $('#pos-p-1').addClass('hide');
        $('#pos-p-2').addClass('hide');
        $('#pos-p-3').removeClass('hide');
    });

    //adding items to the cart
    $('.pos-cloth-items section div').click(function(){
        $('#checkout').removeAttr('disabled');
        let item_category_name = $(this).children().first().text();
        let item_name = $(this).children().last().text();
        switch(item_category_name){
            case _MEN_:
                getItemPrice(item_name,item_category_name);
                break;
            case _WOMEN_:
                getItemPrice(item_name,item_category_name);
                break;
            case _KIDS_:
                getItemPrice(item_name,item_category_name);
                break;
            case _OTHERS_:
                getItemPrice(item_name,item_category_name);
        }
    });
    
    
    $('.list-items').on('click','.remove-item',removeItem);

    $('.list-items').on('click','.add-item',addItem);

    $('#checkout').click(function(){
        let saledate = new Date();
        const sale_date = $('#datepicker').val();
        const sale_time = saledate.getHours() + ":" + saledate.getMinutes();
        let total_price = $('.total-price').text();
        getItemList(sale_date,sale_time,total_price);
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/api/make-sales',
            contentType: 'application/json',
            data: JSON.stringify(_Item),
            processData: false,
            success: function(data){
                _Item._item_s = [];
                $('.total-price').html('0');
                $('#checkout').prop('disabled','true');
                console.log(data);
                /*if(data.redirect){
                    console.log(data.redirect);
                    //window.open(data.redirect);
                    $('.list-items').html("");
                }*/
            },
            error: function(){
                alert('error');
            }
        });
        //alert(JSON.stringify(_Item));
       
    });
});