import React from 'react'

const BreadCrumbs = ({path,title}) => {
  return (
    <div>
        <section class="as_breadcrum_wrapper">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 text-center">
                        <h1>{title}</h1> 

                        <ul class="breadcrumb"> 
                            <li><a href="/">Home</a></li>
                            <li>{path}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}

export default BreadCrumbs
