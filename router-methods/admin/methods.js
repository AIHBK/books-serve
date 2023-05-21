const { v4: uuidv4 } = require('uuid');
const db = require('../../db/mysql');
const sd = require('silly-datetime'); // 获取时间
let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');

// 引入支付宝配置文件
const alipaySdk = require('../../until/alipayUntil')
const AlipaySdkFormData = require('alipay-sdk/lib/form').default
// state = 0 sql-error
// state = 1 success
// state = 2 fail
// state = 3 null
// state >= 4 other


/**
 * 条件查询订单信息
 * @param {*} req 
 * @param {*} res 
 */
exports.searchOrderData = (req, res) => {
  let sql = `select * from bookorder WHERE ?`;
  db.query({
    sql: sql,
    values: [req.body]
  }, (err, data) => {
    if (err) {
      console.log('searchOrderData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('searchOrderData.success');
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 删除订单信息
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteOrder = (req, res) => {
  const sql = `delete from bookorder where id=?`
  console.log('-------req.params', req.params);
  db.query({
    sql: sql,
    values: [req.params.id]
  }, (err, data) => {
    if (err) {
      console.log('returnBooksMessage.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    return res.send({
      state: 1,
      msg: 'success',
    });
  })
}

/**
 * 更新订单信息
 * @param {*} req 
 * @param {*} res 
 */
exports.updataOrder = (req, res) => {
  // updataOrder
  console.log('updataOrder.req.body----', req.body);
  let sql = `UPDATE bookorder SET status=1, btnStatus=1 WHERE id='${req.body.id}'`
  console.log('updataOrder.sql', sql)
  
  db.query({
    sql: sql
  }, (err, data) => {
    if (err) {
      console.log('getOrderData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 获取订单信息
 * @param {*} req 
 * @param {*} res 
 */
exports.getOrderData = (req, res) => {
  console.log('getOrderData.req.body----', req.query);
  let sql = `select * from bookorder where bookid='${ req.query.bookid }' and userid='${ req.query.userid }' and status=${ req.query.status}`
  /**
   * 查询全部还是单个用户
   * type = 1 查询全部
   * type = 0 查询单个用户
   * type = 2 用户id查询
   */
  if (Number(req.query.type) === 1) {
    sql = `select * from bookorder`
    // where status=0
  }
  if (Number(req.query.type) === 2) {
    sql = `select * from bookorder where userid='${ req.query.userid }'`
  }

  db.query({
    sql: sql
  }, (err, selectData) => {
    if (err) {
      console.log('getOrderData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('bookorder.selectData', selectData);
    return res.send({
      state: 1,
      msg: 'success',
      result: selectData
    });

  })
}

/**
 * 添加订单信息
 * @param {*} req 
 * @param {*} res 
 */
exports.addOrderData = (req, res) => {
  console.log('addOrderData.req.body', req.body);
  req.body.id = uuidv4()
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm'); // 当前时间
  db.query({
    sql: `select * from bookorder where bookid='${ req.body.bookid }' and userid='${ req.body.userid }' and status=0`,
  }, (err, selectData) => {
    if (err) {
      console.log('addOrderData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (selectData.length >= 1) {
      console.log('addOrderData.fail 已存在订单', selectData);
      return res.send(
        {
          state: 2,
          msg: '已存在订单',
          result: selectData[0].id
        }
      )
    }
    db.query({
      sql: `insert into bookorder set ?`,
      values: [req.body]
    }, (err, insertData) => {
      if (err) {
        console.log('bookorder.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      console.log('bookorder.insertData', insertData);
      return res.send({
        state: 1,
        msg: 'success',
        result: req.body.id
      });
    })

  })
}

/**
 * 支付宝沙箱支付接口
 * @param {*} req 
 * @param {*} res 
 */
exports.alipaySdkAPI = (req, res) => {
  console.log('alipaySdkAPI.req.body', req.body);
  let orderId = req.body.orderId;
  let price = req.body.price;
  // let name = req.body.name;

  //对接支付宝API
  const formData = new AlipaySdkFormData();
  //调用setMethod 并传入get,会返回可以跳转到支付页面的url,
  formData.setMethod("get");
  //支付时信息
  const bizContent = {
    out_trade_no: orderId,
    product_code: "FAST_INSTANT_TRADE_PAY",
    total_amount: price,
    subject: req.body.bookName,
    body: req.body.content,
  };
  formData.addField("bizContent", bizContent);

  //支付成功或失败的链接
  formData.addField("returnUrl", "http://localhost:8080/#/home/borrow");

  const result = alipaySdk.exec(
    "alipay.trade.page.pay",
    {},
    { formData: formData }
  ).catch(error => console.error('caught error!', error));//promise对象抛出
  //的错误要处理，不然就报错卡住了(〝▼皿▼)
  
  //对接成功，支付宝返回的数据
  result.then((resp) => {
    res.send({
      data: {
        code: 200,
        success: true,
        msg: "支付中",
        paymentUrl: resp,
      },
    });
  });
}



/**
 * 修改图书信息
 * @param {*} req 
 * @param {*} res 
 */
exports.updatedBookData = (req, res) => {
  req.body.recommendNum = Number(req.body.recommendNum)
  req.body.bookNumber = Number(req.body.bookNumber)
  db.query({
    sql: `UPDATE books SET ? WHERE id='${req.body.id}'`,
    values: [req.body]
  }, (err, data) => { 
    if (err) {
      console.log('updatedBookData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
  
}

/**
 * 条件查询图书信息
 * @param {*} req 
 * @param {*} res 
 */
exports.searchBookData = (req, res) => {
  let sql = `select * from books WHERE ?`;
  db.query({
    sql: sql,
    values: [req.body]
  }, (err, data) => {
    if (err) {
      console.log('searchBookData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('searchBookData.success');
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}


/**
 * 获取推荐信息
 * @param {*} req 
 * @param {*} res 
 */
exports.getBooksRecommend = (req, res) => {
  // 查询推荐数降序 前十条
  const sql = `select * from books order by recommendNum desc limit 10`
  db.query({
    sql: sql,
  }, (err, data) => {
    if (err) {
      console.log('returnBooksMessage.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('-------------data', data.length);
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

exports.updataBorrowData = (req, res) => {
  console.log('----------re', req.body);
  db.query({
    sql: `UPDATE books SET status=${ req.body.bookStatus} WHERE id='${req.body.bookid}'`,
  }, (err, insertData) => {
    if (err) {
      console.log('booksBorrow.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (req.body.borrowStatus) {
      db.query({
        sql: `UPDATE booksborrow SET borrowStatus=${ Number(req.body.borrowStatus) } WHERE id='${req.body.id}'`,
      }, (err, insertData) => {
        if (err) {
          console.log('booksBorrow.err', err);
          return res.send(
            {
              state: 0,
              msg: 'sql-err'
            }
          )
        
        }
        if (req.body.rejectStatus) {
          console.log('--------------req.body.status', req.body.rejectStatus);
          db.query({
            sql: `UPDATE booksborrow SET status=${ Number(req.body.rejectStatus) } WHERE id='${req.body.id}'`
          },(err, insertData) => {
            if (err) {
              console.log('booksBorrow.err', err);
              return res.send(
                {
                  state: 0,
                  msg: 'sql-err'
                }
              )
            
            }
            return res.send({
              state: 1,
              msg: 'success'
            });
          })
          return
        }
        return res.send({
          state: 1,
          msg: 'success'
        });
      })
      return
    }
    db.query({
      sql: `UPDATE booksborrow SET status=${ Number(req.body.status) } WHERE id='${req.body.id}'`,
    }, (err, insertData) => {
      if (err) {
        console.log('booksBorrow.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      
      }
      return res.send({
        state: 1,
        msg: 'success'
      });
    })
  })
}

/**
 * 删除借阅信息
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteBooksBorrow = (req, res) => {
  const sql = `delete from booksborrow where id=?`
  console.log('-------req.params', req.params);
  db.query({
    sql: sql,
    values: [req.params.id]
  }, (err, data) => {
    if (err) {
      console.log('returnBooksMessage.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    return res.send({
      state: 1,
      msg: 'success',
    });
  })
}

/**
 * 归还图书
 * @param {*} req 
 * @param {*} res 
 */
exports.returnBooksMessage = (req, res) => {
  const sql = `UPDATE booksborrow SET status=0 WHERE id='${req.body.id}'`
  db.query({
    sql: sql
  }, (err, data) => {
    if (err) {
      console.log('returnBooksMessage.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    return res.send({
      state: 1,
      msg: 'success',
    });
    // if (!data.length) {
    //   return res.send(
    //     {
    //       state: 5,
    //       msg: '已归还'
    //     }
    //   )
    // }
  })
}

/**
 * 归还图书审核
 * @param {*} req 
 * @param {*} res 
 */
exports.passBooksMessage = (req, res) => {
  db.query({
    sql: `select * from books WHERE id='${req.body.bookid}'`
  }, (err, selectData) => {
    if (err) {
      console.log('passBooksMessage.select.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('passBooksMessage.select.success', selectData.length);
    
    db.query({
      sql: `UPDATE booksborrow SET status=${ Number(req.body.status) }, content="${ req.body.content ? req.body.content : '无' }" WHERE id='${ req.body.id }'` // status 归还成功
    }, (err, data) => {
      if (err) {
        console.log('returnBooksMessage.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      if (Number(req.body.status) === -1) {
        return res.send(
          {
            state: 1,
            msg: '拒绝审核'
          }
        ) 
      }
      let bookNumber = selectData[0].bookNumber + 1
      console.log('-------------bookNumber', bookNumber);
      db.query({
        sql: `UPDATE books SET status=0, bookNumber=${ bookNumber } WHERE id='${req.body.bookid}'`
      }, (err, data) => {
        if (err) {
          console.log('passBooksMessage.err', err);
          return res.send(
            {
              state: 0,
              msg: 'sql-err'
            }
          )
        }
        console.log('passBooksMessage.success', data.length);
        return res.send({
          state: 1,
          msg: 'success',
        });
      })
      
    })

    
  })
}

/**
 * 获取借阅信息
 * @param {*} req 
 * @param {*} res 
 */
exports.getBooksBorrow = (req, res) => {
  let sql = ``
  console.log('----req.body', req.query);
  if (req.query.id) { // 传参数为用户信息 不传为管理员
    sql = `select * from booksborrow where userid='${ req.query.id }'`
  } else {
      // sql = `select * from booksborrow where status=${ Number(req.query.status) } or borrowStatus=${ Number(req.query.status) }`
    if (req.query.status) {
      sql = `select * from booksborrow where status=${ Number(req.query.status) }`
    } else {
      sql = `select * from booksborrow where borrowStatus=${ Number(req.query.borrowStatus) }`
    }
    console.log('----', sql);
  }
  db.query({
    sql: sql
  }, (err, data) => {
    if (err) {
      console.log('getBooksBorrow.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('getBooksBorrow.success', data.length);
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 添加借阅信息
 * @param {*} req 
 * @param {*} res 
 */
exports.booksBorrow = (req, res) => {
  req.body.id = uuidv4()
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm'); // 当前时间
  db.query({
    sql: `select * from booksborrow where bookid='${ req.body.bookid }' and userid='${ req.body.userid }' and status=0`,
  },(err, selectData) => {
    if (err) {
      console.log('booksBorrow.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (selectData.length >= 1) {
      console.log('booksBorrow.fail 已借阅');
      return res.send(
        {
          state: 2,
          msg: 'fail'
        }
      )
    }
    db.query({
      sql: `select * from books where id='${ req.body.bookid }'`,
    },(err, booksSelectData) => {
      if (err) {
        console.log('booksBorrow.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      console.log('----------booksSelectData[0]', booksSelectData);
      if (booksSelectData[0].bookNumber === 0) {
        return res.send(
          {
            state: 5,
            msg: '已全部借出'
          }
        )
      }
      console.log('---------booksborrow.req.body', req.body);
      db.query({
        sql: `insert into booksborrow set ?`,
        values: [req.body]
      }, (err, insertData) => {
        if (err) {
          console.log('booksBorrow.err', err);
          return res.send(
            {
              state: 0,
              msg: 'sql-err'
            }
          )
        } 
        // 更新状态 是否借出
        // status= -1
        let bookNumber =  booksSelectData[0].bookNumber - 1
        db.query({
          sql: `UPDATE books SET bookNumber=${ bookNumber },status=${ bookNumber===0 ? -1 : 0 }  WHERE id='${req.body.bookid}'`,
          values: [req.body]
        }, (err, insertData) => {
          if (err) {
            console.log('booksBorrow.err', err);
            return res.send(
              {
                state: 0,
                msg: 'sql-err'
              }
            )
          }
          return res.send({
            state: 1,
            msg: 'success'
          });
        })
      })
    })
    
  })
  
}


/**
 * 推荐图书
 * @param {*} req 
 * @param {*} res 
 */
exports.addRecommendMessage = (req, res) => {
  req.body.id = uuidv4()
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm'); // 当前时间
  const sql = `select * from recommend where bookid='${ req.body.bookid }' and userid='${ req.body.userid }'`
  db.query({
    sql: sql,
  }, (err, data) => {
    if (err) {
      console.log('addRecommendMessage.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (data.length >= 1) {
      console.log('addRecommendMessage.fail 已推荐');
      return res.send({
        state: 2,
        msg: 'fail',
      })
    }
    // 推荐表中插入信息
    db.query({
      sql: `insert into recommend set ?`,
      values: [req.body]
    }, (err, data) => {
      if (err) {
        console.log('addFavoriteBooksData.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      console.log('addFavoriteBooksData.success', data);
      // 修改books表中字段 sql: 
    db.query({
      sql: `select * from books where id='${ req.body.bookid }'`
    }, (err, selectBooksData) => {
      if (err) {
        console.log('addFavoriteBooksData.select.books.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      // 推荐数修改
      let count = selectBooksData[0].recommendNum + 1
      // 修改books表数据
      db.query({
        sql: `UPDATE books SET recommendNum=${ count } WHERE id='${req.body.bookid}'`
      },(err, updateBooksData) => {
        if (err) {
          console.log('addFavoriteBooksData.UPDATE.books.err', err);
          return res.send(
            {
              state: 0,
              msg: 'sql-err'
            }
          )
        }
        return res.send({
          state: 1,
          msg: 'success'
        });
      })
    })
    })
  })
}

/**
 * 删除收藏图书
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteFavoriteBooksData = (req, res) => {
  const data = JSON.parse(req.params.data)
  const sql = `delete from booksfavorite where userid='${ data.userid }'and bookid='${ data.bookid }'`;
  db.query({
    sql: sql
  }, (err, data) => {
    if (err) {
      console.log('deleteFavoriteBooksData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('deleteFavoriteBooksData.success', data);
    return res.send({
      state: 1,
      msg: 'success'
    });

  })
}

/**
 * 添加收藏图书
 * @param {*} req 
 * @param {*} res 
 */
exports.addFavoriteBooksData = (req, res) => {
  req.body.id = uuidv4()
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm'); // 当前时间
  console.log('-----body', req.body);
  db.query({
    sql: `select * from booksfavorite where bookid='${ req.body.bookid }' and userid='${ req.body.userid }'`,
  }, (err, data) => {
    if (err) {
      console.log('addFavoriteBooksData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (data.length >= 1) {
      console.log('addFavoriteBooksData.fail 已收藏');
      return res.send({
        state: 2,
        msg: 'fail',
      })
    }
    db.query({
      sql: `insert into booksfavorite set ?`,
      values: [req.body]
    }, (err, data) => {
      if (err) {
        console.log('addFavoriteBooksData.err', err);
        return res.send(
          {
            state: 0,
            msg: 'sql-err'
          }
        )
      }
      console.log('addFavoriteBooksData.success', data);
      return res.send({
        state: 1,
        msg: 'success',
        result: data
      });
    })
  })

  
}

/**
 * 获取个人收藏图书
 * @param {*} req 
 * @param {*} res 
 */
exports.getFavoriteBooksData = (req, res) => {
  let sql = `select * from books inner join booksfavorite on booksfavorite.bookid = books.id and booksfavorite.userid = '${req.query.id}'`;
  db.query({
    sql: sql,
  },(err, data) => {
    if (err) {
      console.log('getFavoriteBooksData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('getFavoriteBooksData.success', data.length);
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 条件查询用户
 * @param {*} req 
 * @param {*} res 
 */
exports.searchUser = (req, res) => {
  let sql = `select * from user WHERE ?`;
  db.query({
    sql: sql,
    values: [req.body]
  }, (err, data) => {
    if (err) {
      console.log('searchUser.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('searchUser.success');
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 删除用户信息
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteUserData = (req, res) => {
  const sql = 'delete from user where id=?';
  db.query({
    sql: sql,
    values: [req.params.id]
  }, (err, data) => {
    if (err) {
      console.log('deleteUserData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('deleteUserData.success');
    return res.send({
      state: 1,
      msg: 'success'
    });

  })
}

/**
 * 修改用户信息
 * @param {*} req 
 * @param {*} res 
 */
exports.updataUser = (req, res) => {
  const sql = `UPDATE user SET ? WHERE id='${req.body.id}'` 
  delete req.body.id
  req.body.status = Number(req.body.status)
  // if (req.body.roleName) {
  //   req.body.roleName = Number(req.body.roleName)
  // }
  db.query({
    sql: sql,
    values: [req.body]
  }, (err, data) => {
    if (err) {
      console.log('updataUser.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('Login.success.data', data);
    return res.send({
      state: 1,
      msg: 'success',
      list: data
    });

  })

}

/**
 * 批量删除books数据
 * @param {*} req 
 * @param {*} res 
 */
exports.batchDeleteBooksData = (req, res) => {
  const sql = 'delete from books where (id) in (?)';
  db.query({
    sql: sql,
    values: [req.query.data]
  }, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('batchDeleteBooksData.success.data', data);
    return res.send({
        state: 1,
        msg: 'success'
    });
  })
}

/**
 * 登陆接口
 * @param {*} req 
 * @param {*} res 
 */
exports.Login = (req, res) => {
  const sql = 'select * from user where phone=? and password=? and status=1';
  db.query({
    sql: sql,
    values: [req.body.phone, req.body.password]
  },(err, data) => {
    if (err) {
      console.log(err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    if (data.length === 1) {
      db.query({
        sql: 'select * from userinfo',
      }, (err, selectData) => {
        // delete data[0].password
        console.log('Login.success.data', data);
        return res.send({
              state: 1,
              msg: 'success',
              list: data
          });
      }) 
    } else {
      console.log('Login.success.已存在');
      return res.send({
        state: 3,
        msg: 'null',
        list: data
      });
    }
  })
}

/**
 * 注册接口
 * @param {*} req 
 * @param {*} res 
 */
exports.regUser = (req, res) => {
  req.body.id = uuidv4()
  req.body.userCode = uuidv4()
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm'); // 当前时间
  console.log(req.body);
  db.query({
      sql: 'select * from user where phone=?',
      values: [req.body.phone]
  },(err,data)=>{
      if(err){
          console.log('regUser.select.sql-err', err);
          return res.send({
              state: 0,
              msg: 'sql-err'
          });
      }
      if(data.length > 0){
          return res.send({
              state: 3,
              msg: '用户已存在'
          });
      }
      db.query({
          sql: 'insert into user set ?',
          values:[req.body]
      }, (err, data) => {
          if(err){
              console.log('regUser.sql-err-fail', err);
              return res.send({
                  state: 0,
                  msg: 'sql-err-fail'
              });
          }
          console.log('regUser.success', data);
          return res.send({
              state: 1,
              msg: 'success'
          });
      });
  }) 
}

/**
 * 获取用户信息接口
 * @param {*} req 
 * @param {*} res 
 * @param {*} req.query.type -1 已拒绝  0 待审核   
 */
exports.getUsersData = (req, res) => {
  let sql = 'select * from user WHERE status=?';
  db.query({
    sql: sql,
    values: [req.query.type]
  },(err, data) => {
    if (err) {
      console.log('getUsersData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('getUsersData.success', data.length);
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 获取图书信息接口
 * @param {*} req 
 * @param {*} res 
 */
exports.getBooksData = (req, res) => {
  const sql = 'select * from books ORDER BY createDate DESC';
  db.query({
    sql: sql
  },(err, data) => {
    if (err) {
      console.log('getBooksData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      )
    }
    console.log('getBooksData.success', data.length);
    return res.send({
      state: 1,
      msg: 'success',
      result: data
    });
  })
}

/**
 * 删除图书信息
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteBooksData = (req, res) => {
  const sql = 'delete from books where id=?';
  db.query({
    sql: sql,
    values: [req.params.id]
  }, (err, data) => {
    if (err) {
      console.log('deleteBooksData.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('deleteBooksData.success');
    return res.send({
      state: 1,
      msg: 'success'
    });

  })
}

/**
 * 文件上传
 * @param {*} req 
 * @param {*} res 
 */
exports.uploadFile = (req, res) => {
  req.body.id = uuidv4()
  req.body.url = `http://127.0.0.1:3000/img/${req.file.filename}`
  req.body.createDate = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
  console.log('req-----', req.body );
  const sql = `insert into books set ?`;
  db.query({
    sql: sql,
    values: [req.body]
  }, (err, data) => {
    if (err) {
      console.log('uploadFile.err', err);
      return res.send(
        {
          state: 0,
          msg: 'sql-err'
        }
      ) 
    }
    console.log('uploadFile.success');
    return res.send({
      state: 1,
      msg: 'success'
    });
  })
}
