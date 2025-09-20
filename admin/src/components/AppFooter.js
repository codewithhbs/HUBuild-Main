import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span className="ms-1">Copyright &copy; 2024 </span>
        <a href="https://test.dessobuild.com/" target="_blank" rel="noopener noreferrer">
          DessoBuild
        </a>
        <span className="ms-1">. All Right Reserved.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="" target="_blank" rel="noopener noreferrer">
          Hover Business Services LLP
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
