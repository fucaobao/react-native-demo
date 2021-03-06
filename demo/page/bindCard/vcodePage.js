'use strict';
var React = require("react-native");
var Core = require("../../core/core");
var $http = require("../../services/services");
// var PayPage = require("../cashDesk/payPage");

// 控件
var Widget = require('../../widget/widget');
var {
    Style,
    VCode,
    Button,
    Loading
} = Widget;


var commParam = null;
var {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableHighlight
} = React;
var bindCard = function( obj, cb ) {
    var data = {
        smsCode: obj.code,
        bankCardNo: obj.bankCardNo,
        bankName: obj.bankName,
        bankCode: obj.bankCode,
        mobile: obj.tel,
        "_ihome_form_token" : obj.token
    };
    $http.post({
        url : obj.url,
        data : Object.assign(commParam, data),
        success : function( data ) {
            console.info(data);
            if( data.code == '200' ) {
                cb(data.data);
            }else{
                React.Alert.alert(data.message);
            }
        }
    });
};
//获取防重token
var getClickToken = function(cb){
	$http.post({
		url : 'getToken',
        data : commParam,
		success : function(data){
            console.info(data);
			if(data.code == 1){
				cb(data.data);
			}
		}
	});
};
var formatMobile = function( val ) {
    if( val == undefined ) {
		return "";
	}
	var str = "";
	for( var i = 0; i < val.length; i++ ) {
		if( i > 2 && i < 7 ) {
			str += "*";
		}else{
			str += val[i];
		}
	}
	return str;
};
var VCodePage = React.createClass({
    getInitialState : function() {
        return {
            mobile : '',
            tel : '',
            bankCardNo : '',
            code : '',
            bankName : '',
            bankCode : '',
            token : ''
        }
    },
    onPress : function() {
        this.refs.loading.show();
        var navigator = this.props.navigator;
        var obj = this.state;
        var flg = this.props.flg;
        obj.url = 'clientAPI/bindCardAndSetPwd';
        if( flg == 'relative' ) {
            obj.url = 'clientAPI/relatedCertifate';
        }
        var _this = this;
        bindCard(obj, function( data ){
            _this.refs.loading.hide();
            if( flg == 'relative') {
                React.Alert.alert(
                    '温馨提示',
                    "账户关联成功，可以使用信通宝付款了",
                    [
                      {text: 'OK', onPress: () => Core.nextPage("PayPage", {
                          commParam : data
                      }, navigator)},
                    ]
                );
            }else{
                React.Alert.alert(
                    '温馨提示',
                    "账户开通成功，可以使用信通宝付款了",
                    [
                      {text: 'OK', onPress: () => Core.nextPage("PayPage", {
                          commParam : data
                      }, navigator)},
                    ]
                );
            }
        });
    },
    componentDidMount : function() {
        commParam = this.props.commParam;
        console.info(commParam);
        if( commParam == undefined ) {
            commParam = {};
        }
        var m = this.props.mobile;
        var bankCardNo = this.props.bankCardNo;
        var bankName = this.props.bankName;
        var bankCode = this.props.bankCode;
        this.setState({
            mobile : formatMobile(m),
            tel : m,
            bankCardNo : bankCardNo,
            bankName :bankName,
            bankCode : bankCode
        });
        this.refs.vcode.send();
        var _this = this;
        getClickToken(function( str ){
            _this.setState({
                token : str
            });
        });
    },
    onVCodeChange : function( event ) {
        var value = event.nativeEvent.text;
        if( value.length == 6 ) {
            this.setState({
                code : value
            });
            this.refs.btn.setState({
                disabled : false
            });
        }
    },
    render : function() {
        return(
            <ScrollView style={[styles.container]}>
                <Loading ref="loading" />
                <View>
                    <View style={[Style.mix('textRow', 'center')]}>
                      <Text style={[Style.mix('text', 'remark')]}>短信验证码已发送至您的手机</Text>
                      <Text style={[Style.mix('text', 'remark')]}>{this.state.mobile}</Text>
                    </View>
                    <VCode ref="vcode"
                        label='验证码'
                        placeholder='请输入验证码'
                        buttonText='发送'
                        maxLength={6}
                        count={60}
                        onChange={this.onVCodeChange}
                        style={{
                          backgroundColor: '#FFF'
                        }}
                      />
                    <Button text="下一步" disabled="true" ref='btn' onPress={this.onPress}></Button>
                </View>
            </ScrollView>
        )
    }
});
var styles = StyleSheet.create({
    container:{
    	backgroundColor:'#E6E9EB',
    	flex:1
  	},
});
module.exports = VCodePage;
