import axios from "axios";

// 환경 변수에서 API 기본 URL을 가져오거나 기본값(localhost:8080) 사용
const REST_API_BASE_URL = import.meta.env.VITE_APIURL || 'http://localhost:8080/api';
// 직원 관련 API의 기본 URL 구성
const REST_API_URL = `${REST_API_BASE_URL}/employees`;

// 디버깅을 위한 URL 로그 출력
console.log(`REST_API_BASE_URL = ${REST_API_BASE_URL}`);
console.log(`REST_API_URL = ${REST_API_URL}`);

// Axios 인스턴스 생성 (공통 설정 적용)
const api = axios.create({
  baseURL: REST_API_BASE_URL,  // 모든 요청의 기본 URL
  timeout: 10000,              // 10초 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',  // JSON 형식으로 통신
  },
});

/**
 * API 에러 처리 유틸리티 함수
 * @param {Error} error - 발생한 에러 객체
 * @param {string} operation - 수행 중이던 작업명 (에러 메시지에 사용)
 * @throws {Error} 상세한 에러 메시지를 가진 새로운 에러
 */
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  // 서버에서 응답을 받았지만 에러 상태 코드인 경우
  if (error.response) {
    const { status, data } = error.response;
    
    // HTTP 상태 코드에 따른 사용자 친화적인 에러 메시지
    switch (status) {
      case 400:
        throw new Error(data?.message || '잘못된 요청 데이터입니다.');
      case 401:
        throw new Error('인증이 필요합니다.');
      case 403:
        throw new Error('접근이 금지되었습니다.');
      case 404:
        throw new Error('직원을 찾을 수 없습니다.');
      case 409:
        throw new Error(data?.message || '데이터 충돌이 발생했습니다.');
      case 500:
        throw new Error('서버 내부 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      default:
        throw new Error(data?.message || `서버 오류: ${status}`);
    }
  } 
  // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 문제 등)
  else if (error.request) {
    throw new Error('네트워크 연결 오류입니다. 인터넷 연결을 확인해주세요.');
  } 
  // 그 외 기타 에러
  else {
    throw new Error(error.message || '예기치 않은 오류가 발생했습니다.');
  }
};

/**
 * 직원 데이터 유효성 검사 함수
 * @param {Object} employee - 검사할 직원 데이터
 * @throws {Error} 유효성 검사 실패 시 에러 메시지
 */
const validateEmployeeData = (employee) => {
  // 이름(firstName) 필수 검사
  if (!employee.firstName || !employee.firstName.trim()) {
    throw new Error('이름을 입력해주세요.');
  }
  
  // 성(lastName) 필수 검사
  if (!employee.lastName || !employee.lastName.trim()) {
    throw new Error('성을 입력해주세요.');
  }
  
  // 이메일 필수 검사
  if (!employee.email || !employee.email.trim()) {
    throw new Error('이메일을 입력해주세요.');
  }
  
  // 이메일 형식 검사 (정규표현식)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(employee.email)) {
    throw new Error('올바른 이메일 형식이 아닙니다.');
  }
  
  // 부서 ID 필수 검사
  if (!employee.departmentId) {
    throw new Error('부서를 선택해주세요.');
  }
};

// ========== 직원 서비스 함수들 ==========

/**
 * 전체 직원 목록 조회 (부서 정보 포함)
 * @returns {Promise} API 응답 객체
 */
export const listEmployees = async () => {
  try {
    console.log('직원 목록 조회 중...');
    // 부서 정보가 포함된 직원 목록 조회
    const response = await api.get(`/employees/departments`);
    console.log('직원 목록 조회 성공');
    return response;
  } catch (error) {
    handleApiError(error, '직원 목록 조회');
  }
};

/**
 * 새로운 직원 생성
 * @param {Object} employee - 생성할 직원 데이터
 * @returns {Promise} API 응답 객체
 */
export const createEmployee = async (employee) => {
  try {
    // 입력 데이터 유효성 검사
    validateEmployeeData(employee);
    
    console.log('직원 생성 중...');
    const response = await api.post(`/employees`, employee);
    console.log('직원 생성 성공');
    return response;
  } catch (error) {
    handleApiError(error, '직원 생성');
  }
};

/**
 * 특정 직원 상세 정보 조회
 * @param {number|string} employeeId - 조회할 직원 ID
 * @returns {Promise} API 응답 객체
 */
export const getEmployee = async (employeeId) => {
  try {
    // ID 필수 검사
    if (!employeeId) {
      throw new Error('직원 ID가 필요합니다.');
    }
    
    console.log(`직원 ${employeeId} 정보 조회 중...`);
    const response = await api.get(`/employees/${employeeId}`);
    console.log('직원 정보 조회 성공');
    return response;
  } catch (error) {
    handleApiError(error, '직원 정보 조회');
  }
};

/**
 * 직원 정보 수정
 * @param {number|string} employeeId - 수정할 직원 ID
 * @param {Object} employee - 수정할 직원 데이터
 * @returns {Promise} API 응답 객체
 */
export const updateEmployee = async (employeeId, employee) => {
  try {
    // ID 필수 검사
    if (!employeeId) {
      throw new Error('직원 ID가 필요합니다.');
    }
    
    // 입력 데이터 유효성 검사
    validateEmployeeData(employee);
    
    console.log(`직원 ${employeeId} 정보 수정 중...`);
    const response = await api.put(`/employees/${employeeId}`, employee);
    console.log('직원 정보 수정 성공');
    return response;
  } catch (error) {
    handleApiError(error, '직원 정보 수정');
  }
};

/**
 * 직원 삭제
 * @param {number|string} employeeId - 삭제할 직원 ID
 * @returns {Promise} API 응답 객체
 */
export const deleteEmployee = async (employeeId) => {
  try {
    // ID 필수 검사
    if (!employeeId) {
      throw new Error('직원 ID가 필요합니다.');
    }
    
    console.log(`직원 ${employeeId} 삭제 중...`);
    const response = await api.delete(`/employees/${employeeId}`);
    console.log('직원 삭제 성공');
    return response;
  } catch (error) {
    handleApiError(error, '직원 삭제');
  }
};

// Axios 인스턴스 기본 export
export default api;